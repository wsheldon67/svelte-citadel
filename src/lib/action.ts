import { GameError } from "./errors"
import type { Game } from "./game.svelte"
import type { Tile } from "./tile.svelte"
import type { Entity } from "./entity.svelte"


export class Action {
  action_name: string = '<The generic base action name> override this.'
  // TODO: The static property is so annoying to use. Every time I need an action, I usually
  // also need its name, so using the static property means I always have to have both the class
  // and the instance.
  execute(target: Tile, game: Game) {
    throw new GameError("Action.execute must be overridden in subclasses.")
  }
  check(target: Tile, current_game: Game, new_game: Game) {
    return;
  }
  description(target: Tile): string {
    return `${this.action_name} this ${this.entity.data.kind} on ${target.coordinate_data}.`;
  }

  simulate(target: Tile): Game {
    const new_game = this.game.copy()
    new_game.current_user = this.game.current_user
    try {
      this.execute(target, new_game)
    } catch (e) {
      if (!(e instanceof GameError)) throw e
    }
    
    return new_game
  }

  constructor(public entity: Entity, public game: Game) {
    this.entity = entity
    this.game = game
  }
}