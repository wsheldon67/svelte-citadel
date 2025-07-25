import { describe, it, expect } from "vitest"

import { Board } from "./board.svelte"
import type { EntityData } from "./data"

function create_entity_data(kind: string, id: string): EntityData {
  return {
    kind,
    created_by: "test",
    owner: "test",
    id
  }
}


describe("Board.citadels_are_connected", () => {
  it("returns true when there are no citadels", () => {
    const board = new Board({
      name: "test",
      tiles: {
        "0,0": { name: "tile", entities: [create_entity_data("Land", "")] }
      }
    })
    
    expect(board.citadels_are_connected).toBe(true)
  })

  it("returns true when all citadels are connected", () => {
    const board = new Board({
      name: "test",
      tiles: {
        "0,0": { name: "tile2", entities: [create_entity_data("Land", "1"), create_entity_data("Citadel", "4")] },
        "0,1": { name: "tile3", entities: [create_entity_data("Land", "2")] },
        "0,2": { name: "tile4", entities: [create_entity_data("Land", "3"), create_entity_data("Citadel", "5")] }
      }
    })

    expect(board.citadels_are_connected).toBe(true)
  })

  it("returns false when citadels are not connected", () => {
    const board = new Board({
      name: "test",
      tiles: {
        "0,0": { name: "tile1", entities: [create_entity_data("Land", "1"), create_entity_data("Citadel", "2")] },
        "0,1": { name: "tile2", entities: [create_entity_data("Land", "3")] },
        "1,2": { name: "tile3", entities: [create_entity_data("Land", "4"), create_entity_data("Citadel", "5")] }
      }
    })

    expect(board.citadels_are_connected).toBe(false)
  })
})