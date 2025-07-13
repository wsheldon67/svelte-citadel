import type { EntityData } from "./data";
import type { Game } from "./game.svelte";
import type { Tile } from "./tile.svelte";


export enum Layer {WATER, LAND}


export class Entity {
  data: EntityData
  img_path: string;
  layer: Layer = Layer.LAND
  game: Game | null = null

  constructor(data: EntityData, game: Game | null = null) {
    this.data = data
    this.img_path = 'default image path; override in subclasses'
    this.game = game
  }

  move_to(target: Tile) {
    if (!this.game) {
      throw new Error(`Cannot move ${this.data.kind} without a game context`)
    }
  }

}