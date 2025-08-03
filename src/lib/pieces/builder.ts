import { Action } from '$lib/action'
import { Move, PlacePiece } from "$lib/base_actions"
import type { EntityData } from '$lib/data'
import type { EntityList } from '$lib/entity_list'
import { RuleViolation } from '$lib/errors'
import type { Game } from '$lib/game'
import type { Tile } from '$lib/tile'
import { Piece } from '.'
import type { Land } from './land'
import type { CoordinateData } from '$lib/data'

class BuilderMove extends Move {

  check(target: Tile, current_game: Game, new_game: Game): void {
    super.check(target, current_game, new_game)
    if (!target.is_orthagonal_to(this.entity.location as Tile)) {
      throw new RuleViolation(`Entity ${this.entity.data.kind} can only move to orthagonal tiles.`)
    }
  }
}

// The Builder can move land tiles that are orthogonal to it to new positions
// that are orthogonal to that land tile's position.

class SelectLand extends Action {
  action_name: string = 'Select Land'
  declare entity: Builder
  description(target: Tile): string {
    return `Select the land at ${target.coordinate_data} to move it to another tile.`
  }

  check(target: Tile, current_game: Game, new_game: Game): void {
    if (this.entity.selected_land) {
      throw new RuleViolation(`There is already a land tile selected: ${this.entity.selected_land.coordinate_data}.`)
    }
    if (!target.has_entity_by_kind('Land')) {
      throw new RuleViolation(`Tile ${target.coordinate_data} does not have any land to select.`)
    }
    if (!target.is_orthagonal_to(this.entity.location as Tile)) {
      throw new RuleViolation(`Tile ${target.coordinate_data} is not orthagonal to the Builder's location.`)
    }
  }
  execute(target: Tile, game: Game): void {
    this.entity.set_ui_state('selected_land', target.coordinate_data)
  }
}

class MoveLand extends Action {
  action_name: string = 'Move Land'
  declare entity: Builder

  description(target: Tile): string {
    return `Move the selected land to ${target.coordinate_data}.`
  }

  check(target: Tile, current_game: Game, new_game: Game): void {
    if (!this.entity.selected_land) {
      throw new RuleViolation(`No land tile is selected.`)
    }
    if (!target.is_orthagonal_to(this.entity.selected_land as Tile)) {
      throw new RuleViolation(`Tile ${target.coordinate_data} is not orthagonal to the selected land tile.`)
    }
    // TODO Need to is_orthagonal_to to support water tiles.
    // Which also means having an option for get_adjacent to include water tiles.
  }

  execute(target: Tile, game: Game): void {
    const land = this.entity.selected_land?.get_entity_by_kind('Land') as Land
    // If there's not a selected land, don't even simulate it.
    if (!land) return
    this.entity.set_ui_state('selected_land', null)
    land.move_to(target)
  }
}

/* TODO: Big One

  Svelte is driving me crazy.

  Replace all game logic with a non-reactive game class that can be used for simulation.
  Everything that's not in .data is still derived.
  Maybe start with only the game.on('update') event, and see how the performance is.
*/
export class Builder extends Piece {
  constructor(data: EntityData, location: EntityList, game: Game|null=null) {
    super(data, location, game)
    this.img_path = 'shared/Builder.png'
  }

  action_types: typeof Action[] = [
    PlacePiece, BuilderMove, SelectLand, MoveLand
  ]

  get selected_land(): Tile | null {
    return this.ui_state.selected_land ? this.game?.board.get_tile_at(this.ui_state.selected_land) || null : null
  }

}
