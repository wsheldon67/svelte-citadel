import { Entity, Layer } from "./entity.svelte"
import { get_entity } from "./pieces"
import type { EntityListData } from "./data"
import type { Game } from "./game.svelte"

export class EntityList {
  data: EntityListData = $state({name: 'not initialized', entities: []})
  entities: Entity[] = $derived.by(() => {
    return this.data.entities.map(entity_data => get_entity(entity_data))
  })

  constructor(data:EntityListData, public game:Game|null=null) {
    this.data = data
    this.game = game
  }

  get length(): number {
    return this.entities.length
  }

  get_entity_at_layer(layer: Layer): Entity | null {
    return this.entities.find(entity => entity.layer === layer) || null
  }

  get_entities_at_layer(layer: Layer): Entity[] {
    return this.entities.filter(entity => entity.layer === layer)
  }

}