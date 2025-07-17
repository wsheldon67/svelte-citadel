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

}