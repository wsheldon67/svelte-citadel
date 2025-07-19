import { GameError, RuleViolation } from "./errors"
import { Game } from "./game.svelte"
import type { Tile } from "./tile.svelte"
import type { Entity } from "./entity.svelte"


export class Action {
  static action_name: string = '<The generic base action name> override this.'
  execute(target: Tile, game: Game) {
    throw new GameError("Action.execute must be overridden in subclasses.")
  }
  check(target: Tile, current_game: Game, new_game: Game) {
    return;
  }
  description(target: Tile): string {
    return `${Action.action_name} this ${this.entity.data.kind} on ${target.coordinate_data}.`;
  }

  simulate(target: Tile): Game {
    const new_game = new Game(JSON.parse(JSON.stringify(this.game.data)))
    new_game.current_user = this.game.current_user
    this.execute(target, new_game)
    return new_game
  }

  constructor(public entity: Entity, public game: Game) {
    this.entity = entity
    this.game = game
  }
}
export class Place extends Action {
  static action_name = 'place'

  check(target: Tile, current_game: Game, new_game: Game): void {
    // Cannot place on a tile that already has an entity at the same layer
    if (target.has_entity_at_layer(this.entity.layer)) {
      throw new RuleViolation(`Tile ${target.coordinate_data} already has an ${target.get_entity_at_layer(this.entity.layer)!.data.kind} at layer ${this.entity.layer}.`)
    }
  }

  execute(target: Tile, game: Game): void {
    if (target.coordinate_data in game.data.board.tiles) {
      game.data.board.tiles[target.coordinate_data].entities.push(this.entity.data)
    } else {
      game.data.board.tiles[target.coordinate_data] = {
        entities: [this.entity.data],
        name: target.coordinate_data
      }
    }

    game.me!.remove_from_personal_stash(this.entity)
    game.data.turn += 1
  }

}

