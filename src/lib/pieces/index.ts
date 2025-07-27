import type { EntityData } from '$lib/data'
import { Entity, Layer } from '$lib/entity.svelte'
import type { EntityList } from '$lib/entity_list.svelte'
import type { Game } from '$lib/game.svelte'
import type { Tile } from '../tile.svelte'

export class Water extends Entity {
  constructor(data: EntityData, location: Tile) {
    super(data, location)
    this.img_path = 'shared/Water.png'
    this.layer = Layer.WATER
  }
}

export class Piece extends Entity {
  tile: Tile | null = null

  constructor(public data: any, location: EntityList, game: Game | null = null) {
    super(data, location, game)
  }

  move_to(target: Tile) {

  }

  capture_on(target: Tile, options: any = {}) {

  }

}