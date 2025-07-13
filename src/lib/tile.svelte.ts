import { Coordinate } from "./coordinate.svelte";
import type { CoordinateData, EntityListData } from "./data";
import { EntityList } from "./entity_list.svelte";


export class Tile extends EntityList {
  coordinate_data: CoordinateData = $state('0,0')

  coordinate: Coordinate = $derived.by(() => new Coordinate(this.coordinate_data))

  constructor(data: EntityListData, coordinate_data:CoordinateData) {
    super(data)
    this.coordinate_data = coordinate_data
  }
}