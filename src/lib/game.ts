import { GamePhase, type GameData, type PlayerData } from "./data"
import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc, updateDoc, type Unsubscribe } from "firebase/firestore"
import { db, auth } from "./firebase"
import { Player } from './player'
import { Board } from './board'
import { onAuthStateChanged, type User } from "firebase/auth"
import { AuthenticationError, GameError } from "./errors"
import { generate_code } from "./util"
import { EntityList } from "./entity_list"
import { Piece, Water } from "./pieces"
import { Citadel } from './pieces/citadel'
import { Land } from './pieces/land'
import { Builder } from "./pieces/builder"
import type { Entity } from "./entity"
import type { Tile } from "./tile"

export type GameConfig = {
  lands_per_player: number;
  personal_pieces_per_player: number;
  community_pieces_per_player: number;
  citadels_per_player: number;
}

export const blank_config: GameConfig = {
  lands_per_player: 3,
  personal_pieces_per_player: 2,
  community_pieces_per_player: 2,
  citadels_per_player: 1,
}

export const blank_game_data: GameData = {
  players: {},
  board: { name: "Main", tiles: {} },
  turn: 1,
  community_pool: { name: "Community Pool", entities: [] },
  graveyard: { name: "Graveyard", entities: [] },
  phase: GamePhase.LOBBY,
  ...blank_config,
}

export class Game {
  data: GameData = blank_game_data
  game_code: string | null = null
  current_user: User | null = null
  ui_state: Record<string, any> = {}

  entity_types = {
    'Land': Land,
    'Citadel': Citadel,
    'Water': Water,
    'Builder': Builder
  }

  constructor(data: GameData) {
    this.data = data
    onAuthStateChanged(auth, user => this.current_user = user)
    // For debugging purposes in browser only
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.game = this
    }
  }


  get players(): Player[] {
    return Object.values(this.data.players)
      .map(playerData => new Player(playerData, this.entity_types, this))
      .sort((a, b) => a.data.player_order - b.data.player_order)
  }

  get board(): Board {
    return new Board(this.data.board, this)
  }

  get community_pool(): EntityList {
    return new EntityList(this.data.community_pool, this.entity_types, this)
  }

  get graveyard(): EntityList {
    return new EntityList(this.data.graveyard, this.entity_types, this)
  }

  get current_player(): Player {
    return this.players[this.data.turn % this.players.length]
  }

  get me(): Player | null {
    return this.players.find(player => player.data.id === this.current_user?.uid) || null
  }

  get all_personal_stashes(): EntityList {
    const entities = []
    for (const player of this.players) {
      entities.push(...player.personal_stash.entities.map(entity => entity.data))
    }
    return new EntityList({
      entities, name: "All Personal Stashes"
    }, this.entity_types, this)
  }


  static fromConfig(config: GameConfig): Game {
    const initial_data: GameData = {...blank_game_data, ...config}
    return new Game(initial_data)
  }


  subscribe(game_code: string):Unsubscribe {
    console.log("Subscribing to game:", game_code)
    this.game_code = game_code
    return onSnapshot(doc(db, "games", game_code), (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as GameData;
        console.log(gameData)
        this.data = gameData // Update the existing game instance
      } else {
        console.error("No such document!")
      }
    })
  }


  get piece_types(): {[entity_name: string]: typeof Piece} {
    const res: {[entity_name: string]: typeof Piece} = {}
    for (const [key, value] of Object.entries(this.entity_types)) {
      if (value.prototype instanceof Piece) {
        res[key] = value as typeof Piece
      }
    }
    return res
  }





  place_entity(entity: Entity, tile: Tile): void {
    if (!this.me) throw new AuthenticationError("No player is currently signed in")
    if (!this.game_code) throw new GameError("Game code is not set")

    // Check if the entity is in the player's personal stash
    const personal_stash = this.me.personal_stash
    if (!personal_stash || !personal_stash.includes(entity)) {
      throw new GameError(`Entity ${entity.data.kind} is not in the personal stash of player ${this.me.data.name}`)
    }

    if (this.me !== this.current_player) {
      throw new GameError(`It is not ${this.me.data.name}'s turn to place an entity.`)
    }

    updateDoc(doc(db, "games", this.game_code!), {
      [`board.tiles.${tile.coordinate_data}.entities`]: arrayUnion(entity.data),
      [`players.${this.me.data.id}.personal_stash.entities`]: arrayRemove(entity.data),
    })
  }

  create_player_data(name: string, id: string): PlayerData {

    const lands = Array.from({ length: this.data.lands_per_player }).map(() => {
      return { kind: "Land", created_by: id, owner: null, id: generate_code() }
    })

    const citadels = Array.from({ length: this.data.citadels_per_player }).map(() => {
      return { kind: "Citadel", created_by: id, owner: id, id: generate_code() }
    })

    return {
      name,
      id,
      personal_stash: {
        name: "Personal Stash",
        entities: [...lands, ...citadels],
      },
      piece_selection_confirmed: false,
      player_order: this.players.length,
    }
  }

  update_game(): void {
    if (!this.game_code) throw new GameError("Game code is not set")

    setDoc(doc(db, "games", this.game_code), this.data)
  }

  get all_entities(): Entity[] {
    const entities: Entity[] = []
    for (const tile of this.board.tiles) {
      entities.push(...tile.entities)
    }
    entities.push(...this.community_pool.entities)
    for (const player of this.players) {
      entities.push(...player.personal_stash.entities)
    }
    entities.push(...this.graveyard.entities)
    return entities
  }

  copy(): Game {
    return new Game(JSON.parse(JSON.stringify(this.data)))
  }

  add_to_graveyard(entity: Entity): void {
    this.data.graveyard.entities.push(entity.data)
  }

  get_entity_by_id(id: string): Entity | null {
    for (const tile of this.board.tiles) {
      const entity = tile.entities.find(e => e.data.id === id)
      if (entity) return entity
    }

    const cp_entity = this.community_pool.entities.find(e => e.data.id === id)
    if (cp_entity) return cp_entity

    for (const player of this.players) {
      const entity = player.personal_stash.entities.find(e => e.data.id === id)
      if (entity) return entity
    }

    const gv_entity = this.graveyard.entities.find(e => e.data.id === id)
    if (gv_entity) return gv_entity
    return null
  }

}