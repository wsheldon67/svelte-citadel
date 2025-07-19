import { describe, it, expect } from "vitest"

import { Board } from "./board.svelte"


describe("Board.citadels_are_connected", () => {
  it("returns true when there are no citadels", () => {
    const board = new Board({
      name: "test",
      tiles: {
        "0,0": { name: "tile", entities: [{ kind: "Land", created_by: "", id: "" }] }
      }
    })
    
    expect(board.citadels_are_connected).toBe(true)
  })

  it("returns true when all citadels are connected", () => {
    const board = new Board({
      name: "test",
      tiles: {
        "0,0": { name: "tile2", entities: [{ kind: "Land", created_by: "", id: "1" }, { kind: "Citadel", created_by: "", id: "4" }] },
        "0,1": { name: "tile3", entities: [{ kind: "Land", created_by: "", id: "2" }] },
        "0,2": { name: "tile4", entities: [{ kind: "Land", created_by: "", id: "3" }, { kind: "Citadel", created_by: "", id: "5" }] }
      }
    })

    expect(board.citadels_are_connected).toBe(true)
  })

  it("returns false when citadels are not connected", () => {
    const board = new Board({
      name: "test",
      tiles: {
        "0,0": { name: "tile1", entities: [{ kind: "Land", created_by: "", id: "1" }, { kind: "Citadel", created_by: "", id: "2" }] },
        "0,1": { name: "tile2", entities: [{ kind: "Land", created_by: "", id: "3" }] },
        "1,2": { name: "tile3", entities: [{ kind: "Land", created_by: "", id: "4" }, { kind: "Citadel", created_by: "", id: "5" }] }
      }
    })

    expect(board.citadels_are_connected).toBe(false)
  })
})