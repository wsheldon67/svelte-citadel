import type { Entity, Layer } from "./entity.svelte"
import type { EntityListData } from "./data"
import type { Game } from "./game.svelte"
import type { Player } from "./player.svelte"

export class EntityList {
  // data: EntityListData = $state({name: 'not initialized', entities: []})
  entities: Entity[] = $derived.by(() => {
    return this.data.entities.map(entity_data => new this.entity_types[entity_data.kind](entity_data, this, this.game))
  })


  /**
   * A collection of entities.
   * @param data - The data for the entity list.
   * @param entity_types - A map of entity names to their constructors.
   * @param game - The game instance this entity list belongs to, if any.
   */
  constructor(public data:EntityListData, public entity_types:{[entity_name: string]: typeof Entity}, public game:Game|null=null) {
    this.game = game
    this.entity_types = entity_types
  }

  get length(): number {
    return this.data.entities.length
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

  get_entity_by_kind(kind: string|typeof Entity): Entity | null {
    if (typeof kind === 'string') {
      return this.entities.find(entity => entity.data.kind === kind) || null
    }
    return this.entities.find(entity => entity instanceof kind) || null
  }

  get_entities_by_kind(kind: string|typeof Entity): Entity[] {
    if (typeof kind === 'string') {
      return this.entities.filter(entity => entity.data.kind === kind)
    }
    return this.entities.filter(entity => entity instanceof kind)
  }

  has_entity_by_kind(kind: string|typeof Entity): boolean {
    return this.get_entity_by_kind(kind) !== null
  }

  has_entity_at_layer(layer: Layer): boolean {
    return this.get_entity_at_layer(layer) !== null
  }

  get_entity_owned_by(player:Player|string): Entity | null {
    if (typeof player !== 'string') {
      player = player.data.id
    }
    return this.entities.find(entity => entity.data.owner === player) || null
  }

  has_entity_owned_by(player:Player|string): boolean {
    return this.get_entity_owned_by(player) !== null
  }

}