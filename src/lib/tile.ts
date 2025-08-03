import { Board } from "./board"
import { Coordinate } from "./coordinate"
import { generate_code } from "./util"
import { EntityList } from "./entity_list"
import { GameError } from "./errors"
import type { Game } from "./game"
import type { CoordinateData, EntityListData } from "./data"



export class Tile extends EntityList {

  constructor(data: EntityListData, public coordinate_data:CoordinateData, game:Game|null = null) {
    super(data, game!.entity_types, game)
  }

  get coordinate(): Coordinate {
    return new Coordinate(this.coordinate_data)
  }

  get x(): number {return this.coordinate.x}
  get y(): number {return this.coordinate.y}

  is_orthagonal_to(other: Tile): boolean {
    return (this.x === other.x && Math.abs(this.y - other.y) === 1)
      || (this.y === other.y && Math.abs(this.x - other.x) === 1)
  }

  get orthagonal_tiles(): Board {
    if (!this.game) {
      throw new GameError(`Tile ${this.coordinate_data} is not attached to a game.`)
    }
    const filtered_tiles: {[coordinate_data: CoordinateData]: EntityListData } = {}
    this.game.board.tiles.filter(tile => this.is_orthagonal_to(tile)).forEach(tile => {
      filtered_tiles[tile.coordinate_data] = tile.data
    })
    return new Board({
      name: `Orthagonal Tiles of ${this.coordinate_data}`,
      tiles: filtered_tiles
    })
  }

  is_adjacent_to(other: Tile): boolean {
    return (Math.abs(this.x - other.x) <= 1 && Math.abs(this.y - other.y) <= 1)
  }

  get adjacent_tiles(): Board {
    if (!this.game) {
      throw new GameError(`Tile ${this.coordinate_data} is not attached to a game.`)
    }
    const filtered_tiles: {[coordinate_data: CoordinateData]: EntityListData } = {}
    this.game.board.tiles.filter(tile => this.is_adjacent_to(tile)).forEach(tile => {
      filtered_tiles[tile.coordinate_data] = tile.data
    })
    return new Board({
      name: `Adjacent Tiles of ${this.coordinate_data}`,
      tiles: filtered_tiles
    }, this.game)
  }
}

export function create_water_tile(coordinate_data: CoordinateData, game:Game|null=null): Tile {
  return new Tile({
    name: coordinate_data,
    entities: [
      { kind: 'Water', created_by: 'game', owner: 'game', id: generate_code()}
    ],
  }, coordinate_data, game)
}