import type { Coordinate } from "./coordinate.svelte"
import type { BoardData, CoordinateData } from "./data"
import { Entity, Layer } from "./entity.svelte"
import { EntityList } from "./entity_list.svelte"
import { GameError } from "./errors"
import type { Game } from "./game.svelte"
import { create_water_tile, Tile } from "./tile.svelte"

export class Board {
  // data: BoardData = $state({name: 'not initialized', tiles: {}})
  tiles: Tile[]

  constructor(public data:BoardData, public game:Game|null=null) {
    this.game = game
    this.tiles = $derived(
      Object.entries(this.data.tiles).map(([coordinate_data, tile_data]) => {
        return new Tile(tile_data, coordinate_data as CoordinateData, this.game)
      })
  )
  }



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

  get_entities_at(locator: Layer|Coordinate): EntityList {

    if (typeof locator === "string") {
      const entities = this.get_tile_at(locator).entities
      return EntityList.from_entities({entities, name: `Entities at ${locator}`}, this.game!.entity_types, this.game)

    } else if (typeof locator === "number") {
    const entities = this.tiles
      .map(tile => tile.get_entity_at_layer(locator))
      .filter(entity => entity !== null)
    return EntityList.from_entities({entities, name: `Entities at layer ${locator}`}, this.game!.entity_types, this.game)
    
    } else {
      throw new Error(`Invalid locator type: Expected Coordinate or Layer, got '${typeof locator}'`)
    }
  }

  get_adjacent(tile: Tile, orthagonal:boolean=true, diagonal:boolean=false): Board {
    const tiles:Tile[] = []
    const add_if_not_water = (x: number, y: number) => {
      const adjacent_tile = this.get_tile_at(x, y)
      if (adjacent_tile.data.entities[0].kind !== 'Water') {
        tiles.push(adjacent_tile)
      }
    }
    if (orthagonal) {
      add_if_not_water(tile.x, tile.y + 1) // North
      add_if_not_water(tile.x + 1, tile.y) // East
      add_if_not_water(tile.x, tile.y - 1) // South
      add_if_not_water(tile.x - 1, tile.y) // West
    }
    if (diagonal) {
      add_if_not_water(tile.x + 1, tile.y + 1) // North-East
      add_if_not_water(tile.x + 1, tile.y - 1) // South-East
      add_if_not_water(tile.x - 1, tile.y - 1) // South-West
      add_if_not_water(tile.x - 1, tile.y + 1) // North-West
    }
    return new Board({name: 'Adjacent Tiles', tiles: Object.fromEntries(tiles.map(t => [t.coordinate_data, t.data]))}, this.game)
  }

  /**
   * Get all tiles connected to the given tile.
   * @param tile The tile to find connected tiles for.
   */
  get_connected_tiles(tile: Tile): Board {
      const connected_tiles = new Board({name: 'Connected Tiles', tiles: {}}, this.game)
      const visited = new Set<string>()
      const queue = [tile]
      
      // Add the starting tile to visited set and connected_tiles
      visited.add(tile.coordinate_data)
      connected_tiles.data.tiles[tile.coordinate_data] = tile.data

      while (queue.length > 0) {
        const current = queue.shift()!
        const neighbors = this.get_adjacent(current).tiles

        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.coordinate_data)) {
            visited.add(neighbor.coordinate_data)
            queue.push(neighbor)
            connected_tiles.data.tiles[neighbor.coordinate_data] = neighbor.data
          }
        }
      }

      return connected_tiles
    }

  get_entities_by_kind(kind: string|typeof Entity): EntityList {
    const kind_test = typeof kind === 'string' ? (entity: Entity) => entity.data.kind === kind : (entity: Entity) => entity instanceof kind
    const entities = this.tiles.flatMap(tile => tile.entities.filter(kind_test))
    return EntityList.from_entities({entities, name: `Entities of kind ${kind}`}, this.game!.entity_types, this.game)
  }
  // TODO: The entities in the returned EntityList get the new EntityList as their location.
  // The new EntityList is not truly a location, it's more of a view/collection.

  get citadels_are_connected(): boolean {
    const citadels = this.tiles.filter(tile => tile.has_entity_by_kind('Citadel'))
    if (citadels.length < 2) return true
    const first_citadel = citadels[0]
    const connected_tiles = this.get_connected_tiles(first_citadel)
    return citadels.every(citadel => connected_tiles.data.tiles[citadel.coordinate_data] !== undefined)
  }

  find_tile_with_entity(entity: Entity): Tile | null {
    for (const tile of this.tiles) {
      if (tile.includes(entity)) {
        return tile
      }
    }
    return null
  }

  remove_entity(entity: Entity): void {
    if (!(entity.location instanceof Tile)) {
      throw new GameError(`Entity ${entity.data.kind} is not on a tile.`)
    }
    this.game!.data.board.tiles[entity.location.coordinate_data].entities = entity.location.data.entities.filter(e => e.id !== entity.data.id)
  }


  add_entity(entity: Entity, to: Tile): void {
    if (!this.game) throw new Error("Game is not set")
    if (!this.game.data.board.tiles[to.coordinate_data]) {
      this.game.data.board.tiles[to.coordinate_data] = { entities: [], name: to.coordinate_data }
    }
    this.game.data.board.tiles[to.coordinate_data].entities.push(entity.data)
  }


  move_entity(entity: Entity, to: Tile): void {
    if (!(entity.location instanceof Tile)) {
      throw new GameError(`Entity ${entity.data.kind} is not on a tile.`)
    }
    this.remove_entity(entity)
    this.add_entity(entity, to)
  }
}