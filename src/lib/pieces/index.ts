import type { EntityData } from '$lib/data'
import { Entity, Layer } from '$lib/entity.svelte'
import type { Tile } from '../tile.svelte'

export class Water extends Entity {
  constructor(data: EntityData) {
    super(data)
    this.img_path = 'shared/Water.png'
    this.layer = Layer.WATER
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