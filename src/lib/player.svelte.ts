import { type PlayerData } from "./data";
import type { Entity } from "./entity.svelte";
import type { Game } from "./game.svelte";
import { get_entity } from "./pieces";
import { generate_code } from "./util";

export type PlayerConfig = {
  name: string;
  id: string;
  lands_per_player: number;
  citadels_per_player: number;
}

export class Player {
  personal_stash: Entity[]

  constructor (public data:PlayerData, public game: Game | null = null) {
    this.data = data
    this.game = game
    this.personal_stash = $derived(
      this.data.personal_stash.entities.map(entityData => get_entity(entityData, this.game))
    )
  }

  static from_config(config: PlayerConfig): Player {

  const lands = Array.from({ length: config.lands_per_player }).map(() => {
    return { kind: "Land", created_by: config.id, id: generate_code() }
  })

  const citadels = Array.from({ length: config.citadels_per_player }).map(() => {
    return { kind: "Citadel", created_by: config.id, id: generate_code() }
  })

    const initial_data: PlayerData = {
      name: config.name,
      id: config.id,
      personal_stash: {
        name: "Personal Stash",
        entities: [...lands, ...citadels]
      }
    }
    return new Player(initial_data)
  }
}