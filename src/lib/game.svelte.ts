import type { GameData } from "./data";
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc, writeBatch, type Unsubscribe } from "firebase/firestore";
import { db, auth } from "./firebase";
import { Player } from './player.svelte'
import { Board } from './board.svelte';
import { onAuthStateChanged, type User } from "firebase/auth";
import type { Entity } from "./entity.svelte";
import type { Tile } from "./tile.svelte";
import { AuthenticationError, GameError } from "./errors";

export type GameConfig = {
  lands_per_player: number;
  personal_pieces_per_player: number;
  community_pieces_per_player: number;
  citadels_per_player: number;
};

export const blank_config: GameConfig = {
  lands_per_player: 5,
  personal_pieces_per_player: 5,
  community_pieces_per_player: 5,
  citadels_per_player: 1,
};

const blank_game_data: GameData = {
  players: {},
  board: { name: "Main", tiles: {} },
  turn: 1,
  community_pool: { name: "Community Pool", entities: [] },
  graveyard: { name: "Graveyard", entities: [] },
  ...blank_config,
};

export class Game {
  public data: GameData = $state(blank_game_data)
  public game_code: string | null = null


  private current_user: User | null = $state(null)


  public players: Player[] = $derived(
      Object.values(this.data.players).map(playerData => new Player(playerData, this))
    )

  public me: Player | null  = $derived(
      this.current_user && this.players ? this.players.find(player => player.data.id === this.current_user?.uid) || null : null
    )

  public board: Board = $derived(new Board(this.data.board, this))

  public current_player: Player = $derived(
      this.players[this.data.turn % this.players.length]
  )


  constructor(data: GameData) {
    this.data = data
    onAuthStateChanged(auth, user => this.current_user = user)
    // @ts-ignore
    window.game = this // For debugging purposes
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

}