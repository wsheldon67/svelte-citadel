<script lang="ts">
  import { Board } from '$lib/board'
  import TileUi from './TileUI.svelte'
  import { iter_range } from './util'
  import { Tile } from './tile'
  import ObjectViewer from './ObjectViewer.svelte'
  import { debug } from './util.svelte'
  import type { Entity } from './entity'

  let {
    board,
    margin = 2,
    on_click = () => {},
    on_select_entity = () => {},
    selected_entity = null,
    on_click_with_selected = () => {},
    highlighted = [],
  }: {
    board: Board
    margin?: number
    on_click?: (tile: Tile) => void
    on_select_entity?: (entity: Entity) => void
    selected_entity?: Entity | null
    on_click_with_selected?: (tile: Tile, entity: Entity) => void
    highlighted?: [number, number][],
  } = $props();

  function handle_click(tile: Tile) {
    on_click(tile)
    if (board.game?.me && tile.has_entity_owned_by(board.game.me) && !selected_entity) {
      on_select_entity(tile.get_entity_owned_by(board.game.me!)!)
    } else if (selected_entity) {
      on_click_with_selected(tile, selected_entity)
    }
  }

</script>
{#if debug()}
  <ObjectViewer object={board.data} name="Board Data" />
  {#if selected_entity}
    <ObjectViewer object={selected_entity.data} name="Selected Entity Data" />
  {:else}
    <div>No entity selected.</div>
  {/if}
  <ObjectViewer object={highlighted} name="Highlighted Tiles" />
{/if}

<div class="board">
  {#each iter_range(board.extents.y_min - margin, board.extents.y_max + margin) as y}
    <div class="row">
      {#each iter_range(board.extents.x_min - margin, board.extents.x_max + margin) as x}
        <div
          class:selected={selected_entity && board.get_tile_at(x, y).includes(selected_entity)}
          class:highlighted={highlighted.some(([hx, hy]) => hx === x && hy === y)}
        >
          <TileUi
            tile={board.get_tile_at(x, y)}
            on_click={() => handle_click(board.get_tile_at(x, y))}
          />
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    gap: 0.1rem;
  }
  .board {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .selected {
    border: 2px solid blue;
  }
  .highlighted {
    border: 4px solid red;
  }
</style>