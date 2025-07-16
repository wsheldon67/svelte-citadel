import type { BoardData, CoordinateData } from "./data"
import type { Layer } from "./entity.svelte"
import { EntityList } from "./entity_list.svelte"
import type { Game } from "./game.svelte"
import { create_water_tile, Tile } from "./tile.svelte"

export class Board {
  data: BoardData = $state({name: 'not initialized', tiles: {}})

  constructor(data:BoardData, public game:Game|null=null) {
    this.data = data
    this.game = game
  }

  tiles: Tile[] = $derived(
    Object.entries(this.data.tiles).map(([coordinate_data, tile_data]) => {
      return new Tile(tile_data, coordinate_data as CoordinateData, this.game)
    })
  )

  extents: {
    x_min: number, x_max: number, y_min: number, y_max: number
  } = $derived.by(() => {
    const keys = Object.keys(this.data.tiles) as CoordinateData[]
    const coordinates = keys.map(coordinate => coordinate.split(',').map(Number))
    const x_max = Math.max(...coordinates.map(coord => coord[0]), 0)
    const y_max = Math.max(...coordinates.map(coord => coord[1]), 0)
    const x_min = Math.min(...coordinates.map(coord => coord[0]), 0)
    const y_min = Math.min(...coordinates.map(coord => coord[1]), 0)
    return { x_min, x_max, y_min, y_max }
  })



  has_entity_at_layer(layer: Layer): boolean {
    return this.tiles.some(tile => tile.has_entity_at_layer(layer))
  }

  get_tile_at(x: number|CoordinateData, y: number|null=null): Tile {
    const coordinate = typeof x === "string" ? x : `${x},${y}` as CoordinateData
    return this.data.tiles[coordinate] ? new Tile(this.data.tiles[coordinate], coordinate, this.game) : create_water_tile(coordinate, this.game)
  }

  get_entities_at_layer(layer: Layer): EntityList {
    const entities = this.tiles
      .map(tile => tile.get_entity_at_layer(layer)?.data)
      .filter(entity => entity !== undefined)
    return new EntityList({entities, name: `Entities at layer ${layer}`}, this.game)
  }
}