import type { Tile } from '$lib/tile.svelte'
import { Piece } from '.'


class Turtle extends Piece {
  can_move_to(target: Tile) {
    if (target.has_entity_at_layer(0)) return false
    if (!target.is_adjacent_to(this.tile!)) return false
    return true
  }

  can_place_on(target: Tile) {
    if (target.has_entity_at_layer(0)) return false
    return true
  }

  can_capture_on(target: Tile) {
    if (target.is_orthagonal_to(this.tile!)) return true
    if (target == this.tile) return true
    return false
  }

  capture_on(target: Tile) {
    super.capture_on(target, { take_place: false })
  }
}
