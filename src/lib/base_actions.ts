import { Action } from "./action"
import { RuleViolation } from "./errors"
import type { Game } from "./game"
import { Piece } from "./pieces"
import { Citadel } from "./pieces/citadel"
import { Tile } from "./tile"


export class Place extends Action {
  action_name = 'place'

  check(target: Tile, current_game: Game, new_game: Game): void {
    // Cannot place on a tile that already has an entity at the same layer
    if (target.has_entity_at_layer(this.entity.layer)) {
      throw new RuleViolation(`Tile ${target.coordinate_data} already has an ${target.get_entity_at_layer(this.entity.layer)!.data.kind} at layer ${this.entity.layer}.`)
    }
    // Cannot place if the entity is already on the board
    if (this.entity.location instanceof Tile) {
      throw new RuleViolation(`Entity ${this.entity.data.kind} is already on the board at ${this.entity.location.coordinate_data}.`)
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

export class PlacePiece extends Place {
  action_name: string = 'place'
  check(target: Tile, current_game: Game, new_game: Game): void {
    super.check(target, current_game, new_game)
    // Can only place tiles adjacent to a citadel owned by the player
    const is_adjacent_to_citadel = current_game.me!.citadels.entities
        .some(citadel => target.is_adjacent_to(citadel.location as Tile))
    if (!is_adjacent_to_citadel) {
      throw new RuleViolation(`Tile ${target.coordinate_data} is not adjacent to any of your citadels.`)
    }
  }

}


export class Capture extends Action {
  action_name = 'capture'

  check(target: Tile, current_game: Game, new_game: Game): void {
    // Can only capture Pieces or Citadels.
    if (!target.entities.some(e => e instanceof Piece || e instanceof Citadel)) {
      throw new RuleViolation(`Cannot capture on ${target.coordinate_data} because it does not have a Piece or Citadel.`);
    }
  }

  execute(target: Tile, game: Game): void {
    const to_capture = target.get_entities_by_kind(Piece).concat(target.get_entities_by_kind(Citadel))[0]

    game.add_to_graveyard(to_capture)
    game.board.remove_entity(to_capture)
    game.board.move_entity(this.entity, target)
    game.data.turn += 1
  }
}



export class Move extends Action {
  action_name = 'move'

  check(target: Tile, current_game: Game, new_game: Game): void {
    // Cannot move to a tile that already has an entity at the same layer
    if (target.has_entity_at_layer(this.entity.layer)) {
      throw new RuleViolation(`Tile ${target.coordinate_data} already has an ${target.get_entity_at_layer(this.entity.layer)!.data.kind} at layer ${this.entity.layer}.`)
    }
    if (!(this.entity.location instanceof Tile)) {
      throw new RuleViolation(`Entity ${this.entity.data.kind} is not on a tile.`)
    }
  }

  execute(target: Tile, game: Game): void {
    game.board.move_entity(this.entity, target)
    game.data.turn += 1
  }
}