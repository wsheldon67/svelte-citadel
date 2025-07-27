import { Place } from '$lib/action'
import type { EntityData } from '$lib/data'
import { Entity, Layer } from '$lib/entity.svelte'
import { RuleViolation } from '$lib/errors'
import type { Game } from '$lib/game.svelte'
import type { Tile } from '$lib/tile.svelte'


export class Land extends Entity {
  constructor(data: EntityData, game: Game | null = null) {
    super(data, game)
    this.img_path = 'shared/Land.png'
    this.layer = Layer.LAND
  }

  actions_types = [
    class PlaceLand extends Place {
      check(target: Tile, current_game: Game, new_game: Game) {
        super.check(target, current_game, new_game)
        const number_of_lands = current_game.board.get_entities_at(Layer.LAND).length
        const has_adjacent_land = target.adjacent_tiles.has_entity_at_layer(Layer.LAND)
        if (number_of_lands > 0 && !has_adjacent_land) {
          throw new RuleViolation(`Land can only be placed on a tile adjacent to another land tile.`)
        }
      }
    }
  ];

}
