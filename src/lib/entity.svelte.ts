import { Action } from "./action"
import { GameError, RuleViolation } from "./errors"
import type { EntityData } from "./data"
import type { Game } from "./game.svelte"
import type { Tile } from "./tile.svelte"
import type { EntityList } from "./entity_list.svelte"


export enum Layer {WATER, LAND, WALKING, FLYING}

export class Entity {
  data: EntityData
  img_path: string;
  layer: Layer = Layer.WALKING
  game: Game | null = null
  #actions: Action[] | null = null
  location: EntityList

  action_types: typeof Action[] = []

  constructor(data: EntityData, location: EntityList, game: Game | null = null) {
    this.data = data
    this.img_path = 'default image path; override in subclasses'
    this.game = game
    this.location = location
  }

  get actions(): Action[] {
    if (!this.#actions) {
      this.#actions = this.action_types.map(action_type => new action_type(this, this.game!))
    }
    return this.#actions
  }


  check_action(action_name: string, target: Tile): Action {
    // Throw general game errors applicable to all actions
    const action = this.actions.find(action => action.action_name === action_name)
    if (!action) {
      throw new GameError(`Action ${action_name} is not defined for entity kind '${this.data.kind}'`)
    }
    if (!this.game) {
      throw new GameError(`Entity ${this.data.kind} is not attached to a game.`)
    }
    if (!this.game.me) {
      throw new GameError("No player is currently signed in")
    }
    if (this.game.me !== this.game.current_player) {
      throw new GameError(`It is not ${this.game.me.data.name}'s turn.`)
    }
    const new_game = action.simulate(target)
    if (!new_game.board.citadels_are_connected) {
      throw new RuleViolation(`This action would disconnect the citadels.`)
    }
    action.check(target, this.game, new_game)
    return action
  }

  do_action(action_name:string, target:Tile) {
    const action = this.check_action(action_name, target)
    action.execute(target, this.game!)
    this.game!.update_game()
  }

  get_action(action_name: string): Action {
    return this.actions.find(action => action.action_name === action_name)!
  }

  has_action_on_tile(x: number, y: number): boolean {
    if (!this.game) {
      return false
    }
    const tile = this.game.board.get_tile_at(x, y)
    return this.actions.some(action => {
      try {
        this.check_action(action.action_name, tile)
        console.log(`Action ${action.action_name} is valid on tile (${x}, ${y}) for entity ${this.data.kind}`)
        return true
      } catch (e) {
        console.log(`Action ${action.action_name} is NOT valid on tile (${x}, ${y}) for entity ${this.data.kind}:`, e)
        if (e instanceof GameError) return false
        if (e instanceof RuleViolation) return false
        throw e // rethrow unexpected errors
      }
    })
  }

  get_actions_on_tile(x: number, y: number): Action[] {
    if (!this.game) {
      return []
    }
    const tile = this.game.board.get_tile_at(x, y)
    return this.actions.filter(action => {
      try {
        this.check_action(action.action_name, tile)
        return true
      } catch (e) {
        if (e instanceof GameError || e instanceof RuleViolation) {
          return false
        }
        throw e // rethrow unexpected errors
      }
    })
  }

}


