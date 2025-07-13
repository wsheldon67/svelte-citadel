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

  extents: { x: number, y: number } = $derived.by(() => {
    const keys = Object.keys(this.data.tiles) as CoordinateData[]
    const coordinates = keys.map(coordinate => coordinate.split(',').map(Number))
    const maxX = Math.max(...coordinates.map(coord => coord[0]), 0)
    const maxY = Math.max(...coordinates.map(coord => coord[1]), 0)
    return { x: maxX + 1, y: maxY + 1 }
  })

  constructor(data: BoardData) {
    this.data = data
  }
}