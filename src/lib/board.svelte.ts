import type { BoardData, CoordinateData } from "./data";
import { Tile } from "./tile.svelte";

export class Board {
  data: BoardData = $state({name: 'not initialized', tiles: {}})

  tiles: {[coordinate: CoordinateData]: Tile} = $derived.by(() => {
    const tiles: {[coordinate: CoordinateData]: Tile} = {}
    const keys = Object.keys(this.data.tiles) as CoordinateData[]
    keys.forEach(coordinate_data => {
      tiles[coordinate_data] = new Tile(this.data.tiles[coordinate_data], coordinate_data)
    })
    return tiles
  })

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

  constructor(data: BoardData) {
    this.data = data
  }
}