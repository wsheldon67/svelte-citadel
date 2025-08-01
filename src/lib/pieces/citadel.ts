import { Place } from "$lib/base_actions"
import type { EntityData } from '$lib/data'
import { Entity, Layer } from '$lib/entity.svelte'
import type { EntityList } from "$lib/entity_list.svelte"
import { RuleViolation } from '$lib/errors'
import type { Game } from '$lib/game.svelte'
import type { Tile } from '$lib/tile.svelte'


export class Citadel extends Entity {
  constructor(data: EntityData, location: EntityList, game: Game | null = null) {
    super(data, location, game)
    this.img_path = 'shared/Citadel.png'
  }

  action_types = [
    class PlaceCitadel extends Place {
      check(target: Tile, current_game: Game, new_game: Game) {
        super.check(target, current_game, new_game)
        const all_lands = current_game.all_personal_stashes.get_entities_at_layer(Layer.LAND)
        if (all_lands.length > 0) {
          throw new RuleViolation(`Citadels can only be placed after all lands have been placed.`)
        }
      }
    }
  ];
}
