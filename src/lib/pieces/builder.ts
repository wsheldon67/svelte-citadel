import { Place, type Action } from '$lib/action'
import type { EntityData } from '$lib/data'
import type { Game } from '$lib/game.svelte'
import type { Tile } from '$lib/tile.svelte'
import { Piece } from '.'


export class Builder extends Piece {
  selected_land: Tile | null = null
  constructor(data: EntityData, game: Game|null=null) {
    super(data, game)
    this.img_path = 'shared/Builder.png'
  }

  action_types: typeof Action[] = [
    Place
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
