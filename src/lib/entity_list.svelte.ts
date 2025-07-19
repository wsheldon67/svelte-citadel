import { Entity, Layer } from "./entity.svelte"
import type { EntityListData } from "./data"
import type { Game } from "./game.svelte"

export class EntityList {
  data: EntityListData = $state({name: 'not initialized', entities: []})
  entities: Entity[] = $derived.by(() => {
    return this.data.entities.map(entity_data => new this.entity_types[entity_data.kind](entity_data, this.game))
  })


  /**
   * A collection of entities.
   * @param data - The data for the entity list.
   * @param entity_types - A map of entity names to their constructors.
   * @param game - The game instance this entity list belongs to, if any.
   */
  constructor(data:EntityListData, public entity_types:{[entity_name: string]: typeof Entity}, public game:Game|null=null) {
    this.data = data
    this.game = game
    this.entity_types = entity_types
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

  includes(entity: Entity): boolean {
    return this.entities.includes(entity)
  }

}