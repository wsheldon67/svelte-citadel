import type { EntityData } from '$lib/data'
import { Entity, Layer } from '$lib/entity.svelte'
import type { Tile } from '../tile.svelte'

export function get_entity(entityData: EntityData): Entity {
  switch (entityData.kind) {
    case "Land":
      return new Land(entityData)
    case "Citadel":
      return new Citadel(entityData)
    case "Water":
      return new Water(entityData)
    default:
      throw new Error(`Unknown entity kind: ${entityData.kind}`)
  }
}

export class Land extends Entity {
  constructor(data: EntityData) {
    super(data)
    this.img_path = 'shared/Land.png'
    this.layer = 0
  }

}

export class Citadel extends Entity {
  constructor(data: EntityData) {
    super(data)
    this.img_path = 'shared/Citadel.png'
  }
}

export class Water extends Entity {
  constructor(data: EntityData) {
    super(data)
    this.img_path = 'shared/Water.png'
    this.layer = 0
  }
}

export class Piece extends Entity {
  tile: Tile | null = null

  constructor(public data: any) {
    super(data)
  }

  move_to(target: Tile) {

  }

  capture_on(target: Tile, options: any = {}) {

  }

}


class Builder extends Piece {
  selected_land:Tile|null = null

  can_move_to(target:Tile) {
    return target.is_orthagonal_to(this.tile!)
  }

  move_to(target:Tile) {
    this.selected_land = null
    super.move_to(target)
  }

  capture_on(target:Tile) {
    this.selected_land = null
    super.capture_on(target)
  }

  can_select_land(target:Tile) {
    if (!target.has_entity_at_layer(0)) return false
    if (!target.is_orthagonal_to(this.tile!)) return false
    return true
  }

  select_land(target:Tile) {
    this.selected_land = target
  }

  can_move_selected_land(target:Tile) {
    if (!this.selected_land) return false
    if (!this.selected_land.is_orthagonal_to(target)) return false
    if (target.has_entity_at_layer(0)) return false
    return true
  }

  move_selected_land(target:Tile) {
    this.selected_land!.get_entity_at_layer(0)!.move_to(target)
    this.selected_land = null
  }
}


class Turtle extends Piece {
  can_move_to(target:Tile) {
    if (target.has_entity_at_layer(0)) return false
    if (!target.is_adjacent_to(this.tile!)) return false
    return true
  }

  can_place_on(target:Tile) {
    if (target.has_entity_at_layer(0)) return false
    return true
  }

  can_capture_on(target:Tile) {
    if (target.is_orthagonal_to(this.tile!)) return true
    if (target == this.tile) return true
    return false
  }

  capture_on(target:Tile) {
    super.capture_on(target, {take_place: false})
  }
}