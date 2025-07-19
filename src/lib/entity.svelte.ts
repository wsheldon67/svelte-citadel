import { Action } from "./action"
import { GameError, RuleViolation } from "./errors"
import type { EntityData } from "./data"
import type { Game } from "./game.svelte"
import type { Tile } from "./tile.svelte"


export enum Layer {WATER, LAND, WALKING, FLYING}

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
    const new_game = action.simulate(target)
    if (!new_game.board.citadels_are_connected) {
      throw new RuleViolation(`This action would disconnect the citadels.`)
    }
    action.check(target, this.game, new_game)
    action.execute(target, this.game)
    this.game.update_game()
  }

  get_action(action_name: string): typeof Action {
    return this.actions.find(action => action.action_name === action_name)!
  }

}


