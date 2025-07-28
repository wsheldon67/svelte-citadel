import { type PlayerData } from "./data"
import type { Entity } from "./entity.svelte"
import { EntityList } from "./entity_list.svelte"
import type { Game } from "./game.svelte"
import { Citadel } from "./pieces/citadel"

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

  get community_pieces(): EntityList {
    if (!this.game) {
      throw new Error("Game is not set for this player")
    }
    const entities = this.game.community_pool.entities.filter(e => e.data.created_by === this.data.id)

    return EntityList.from_entities({
      name: `${this.data.name}'s Community Pieces`,
      entities
    }, this.game.entity_types, this.game)
  }

  get is_done_choosing_personal_pieces(): boolean {
    if (!this.game) {
      throw new Error("Game is not set for this player")
    }
    return this.data.personal_stash.entities.length >= this.game!.data.personal_pieces_per_player
  }

  get is_done_choosing_community_pieces(): boolean {
    if (!this.game) {
      throw new Error("Game is not set for this player")
    }
    return this.community_pieces.entities.length >= this.game!.data.community_pieces_per_player
  }

  get is_done_choosing_pieces(): boolean {
    return this.is_done_choosing_personal_pieces && this.is_done_choosing_community_pieces
  }

  get citadels(): EntityList {
    if (!this.game) {
      throw new Error("Game is not set for this player")
    }
    return this.game.board
      .get_entities_by_kind(Citadel)
      .get_entities_owned_by(this)
  }

}