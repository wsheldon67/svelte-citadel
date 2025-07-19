import { type PlayerData } from "./data"
import type { Entity } from "./entity.svelte"
import { EntityList } from "./entity_list.svelte"
import type { Game } from "./game.svelte"

export type PlayerConfig = {
  name: string
  id: string
  lands_per_player: number
  citadels_per_player: number
}

export class Player {
  personal_stash: EntityList

  constructor (public data:PlayerData, entity_types: {[entity_name: string]: typeof Entity}, public game: Game | null = null) {
    this.data = data
    this.game = game
    this.personal_stash = $derived(
      new EntityList({
        name: `${this.data.name}'s Personal Stash`,
        entities: this.data.personal_stash.entities
      }, entity_types, this.game)
    )
  }

  remove_from_personal_stash(entity: Entity) {
    this.data.personal_stash.entities = this.data.personal_stash.entities
      .filter(e => e.id !== entity.data.id)
  }

}