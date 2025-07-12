import { type PlayerData } from "./data";
import type { Entity } from "./entity.svelte";
import { get_entity } from "./pieces";

export type PlayerConfig = {
  name: string;
  id: string;
  lands_per_player: number;
  citadels_per_player: number;
}

export class Player {
  data:PlayerData
  personal_stash: Entity[];

  constructor (data:PlayerData) {
    this.data = data
    this.personal_stash = $derived(
      this.data.personal_stash.entities.map(entityData => get_entity(entityData))
    )
  }

  static from_config(config: PlayerConfig): Player {

  const lands = Array.from({ length: config.lands_per_player }).map(() => {
    return { kind: "Land", created_by: config.id }
  })

  const citadels = Array.from({ length: config.citadels_per_player }).map(() => {
    return { kind: "Citadel", created_by: config.id }
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