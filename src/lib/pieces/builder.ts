import { type Action } from '$lib/action'
import { Move, Place } from "$lib/base_actions"
import type { EntityData } from '$lib/data'
import type { EntityList } from '$lib/entity_list.svelte'
import { RuleViolation } from '$lib/errors'
import type { Game } from '$lib/game.svelte'
import type { Tile } from '$lib/tile.svelte'
import { Piece } from '.'

class BuilderMove extends Move {

  check(target: Tile, current_game: Game, new_game: Game): void {
    super.check(target, current_game, new_game)
    if (!target.is_orthagonal_to(this.entity.location as Tile)) {
      throw new RuleViolation(`Entity ${this.entity.data.kind} can only move to orthagonal tiles.`)
    }
  }
}


export class Builder extends Piece {
  selected_land: Tile | null = null
  constructor(data: EntityData, location: EntityList, game: Game|null=null) {
    super(data, location, game)
    this.img_path = 'shared/Builder.png'
  }

  action_types: typeof Action[] = [
    Place, BuilderMove
  ]

  can_move_to(target: Tile) {
    return target.is_orthagonal_to(this.tile!)
  }

  move_to(target: Tile) {
    this.selected_land = null
    super.move_to(target)
  }

  capture_on(target: Tile) {
    this.selected_land = null
    super.capture_on(target)
  }

  can_select_land(target: Tile) {
    if (!target.has_entity_at_layer(0)) return false
    if (!target.is_orthagonal_to(this.tile!)) return false
    return true
  }

  select_land(target: Tile) {
    this.selected_land = target
  }

  can_move_selected_land(target: Tile) {
    if (!this.selected_land) return false
    if (!this.selected_land.is_orthagonal_to(target)) return false
    if (target.has_entity_at_layer(0)) return false
    return true
  }

  move_selected_land(target: Tile) {
    this.selected_land!.get_entity_at_layer(0) // FIXME move_to
    this.selected_land = null
  }
}
