import type { EntityListData } from "./data";
import { Entity } from "./entity.svelte";
import { get_entity } from "./pieces";

export class EntityList {
  data: EntityListData = $state({name: 'not initialized', entities: []})
  entities: Entity[] = $derived.by(() => {
    return this.data.entities.map(entity_data => get_entity(entity_data))
  })

  constructor(data: EntityListData) {
    this.data = data
  }

}