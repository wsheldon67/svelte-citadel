import { Coordinate } from "./coordinate.svelte";
import type { CoordinateData, EntityListData } from "./data";
import { Layer, type Entity } from "./entity.svelte";
import { EntityList } from "./entity_list.svelte";


export class Tile extends EntityList {
  coordinate_data: CoordinateData = $state('0,0')

  coordinate: Coordinate = $derived.by(() => new Coordinate(this.coordinate_data))

  constructor(data: EntityListData, coordinate_data:CoordinateData) {
    super(data)
    this.coordinate_data = coordinate_data
  }

  get x(): number {return this.coordinate.x}
  get y(): number {return this.coordinate.y}

  is_orthagonal_to(other: Tile): boolean {
    return (this.x === other.x && Math.abs(this.y - other.y) === 1)
      || (this.y === other.y && Math.abs(this.x - other.x) === 1)
  }

  is_adjacent_to(other: Tile): boolean {
    return (Math.abs(this.x - other.x) <= 1 && Math.abs(this.y - other.y) <= 1)
  }

  get_entity_by_kind(kind: string): Entity | null {
    return this.entities.find(entity => entity.data.kind === kind) || null
  }

  has_entity_by_kind(kind: string): boolean {
    return this.get_entity_by_kind(kind) !== null
  }

  get_entity_at_layer(layer: Layer): Entity | null {
    return this.entities.find(entity => entity.layer === layer) || null
  }

  has_entity_at_layer(layer: Layer): boolean {
    return this.get_entity_at_layer(layer) !== null
  }
}

export function create_water_tile(coordinate_data: CoordinateData): Tile {
  return new Tile({
    name: coordinate_data,
    entities: [
      { kind: 'Water', created_by: 'game'}
    ],
  }, coordinate_data)
}