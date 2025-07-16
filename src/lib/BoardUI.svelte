<script lang="ts">
  import { Board } from '$lib/board.svelte'
  import TileUi from './TileUI.svelte'
  import { iter_range } from './util'
  import { Tile } from './tile.svelte'
  import ObjectViewer from './ObjectViewer.svelte'
  import { debug } from './util.svelte'

  const {
    board,
    margin = 2,
    on_click = () => {},
  }: {
    board: Board,
    margin?: number,
    on_click?: (tile: Tile) => void,
  } = $props();


</script>
{#if debug()}
<ObjectViewer object={board.data} name="Board Data" />
{/if}

<div class="board">
  {#each iter_range(board.extents.y_min - margin, board.extents.y_max + margin) as y}
    <div class="row">
      {#each iter_range(board.extents.x_min - margin, board.extents.x_max + margin) as x}
        <TileUi
          tile={board.get_tile_at(x, y)}
          on_click={() => on_click(board.get_tile_at(x, y))}
        />
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
</style>