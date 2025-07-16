import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import type { EntityData } from "./data";
import { GameError, RuleViolation } from "./errors";
import type { Game } from "./game.svelte";
import type { Tile } from "./tile.svelte";
import { db } from "./firebase";


export enum Layer {WATER, LAND, WALKING, FLYING}

export class Action {
  static action_name: string = '<The generic base action name> override this.'
  execute(target: Tile) {
    throw new GameError("Action.execute must be overridden in subclasses.")
  }
  check(target: Tile) {
    return
  }
  description(target: Tile): string {
    return `${Action.action_name} this ${this.entity.data.kind} on ${target.coordinate_data}.`
  }

  constructor(public entity: Entity, public game: Game) {
    this.entity = entity
    this.game = game
  }
}


export class Entity {
  data: EntityData
  img_path: string;
  layer: Layer = Layer.WALKING
  game: Game | null = null

  constructor(data: EntityData, game: Game | null = null) {
    this.data = data
    this.img_path = 'default image path; override in subclasses'
    this.game = game
  }

  actions: typeof Action[] = []

  do_action(action_name:string, target:Tile) {
    // Throw general game errors applicable to all actions
    const SelectedAction = this.actions.find(action => action.action_name === action_name)
    if (!SelectedAction) {
      throw new GameError(`Action ${action_name} is not defined for entity kind '${this.data.kind}'`)
    }
    if (!this.game) {
      throw new GameError(`Entity ${this.data.kind} is not attached to a game.`)
    }
    if (!this.game.me) {
      throw new GameError("No player is currently signed in")
    }
    if (!this.game.me.personal_stash.includes(this)) {
      throw new GameError(`Entity ${this.data.kind} is not in the personal stash of player ${this.game.me.data.name}`)
    }
    if (this.game.me !== this.game.current_player) {
      throw new GameError(`It is not ${this.game.me.data.name}'s turn.`)
    }
    const action = new SelectedAction(this, this.game)
    action.check(target)
    action.execute(target)
  }

  get_action(action_name: string): typeof Action {
    return this.actions.find(action => action.action_name === action_name)!
  }

}


export class Place extends Action {
    static action_name = 'place'
    check(target: Tile) {
      // Cannot place on a tile that already has an entity at the same layer
      if (target.has_entity_at_layer(this.entity.layer)) {
        throw new RuleViolation(`Tile ${target.coordinate_data} already has an ${target.get_entity_at_layer(this.entity.layer)!.data.kind} at layer ${this.entity.layer}.`)
      }
    }
    execute(target: Tile): void {
      updateDoc(doc(db, 'games', this.game!.game_code!), {
        [`board.tiles.${target.coordinate_data}.entities`]: arrayUnion(this.entity.data),
        [`players.${this.game!.me!.data.id}.personal_stash.entities`]: arrayRemove(this.entity.data),
      })
    }
}