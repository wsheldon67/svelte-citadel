<script lang="ts">
  import { Board } from '$lib/board.svelte';
  import TileUi from './TileUI.svelte';
  import { iter_range } from './util';
  import type { CoordinateData } from './data';
  import { create_water_tile, Tile } from './tile.svelte';
    import ObjectViewer from './ObjectViewer.svelte';

  const {
    board,
    margin = 1,
    on_click = () => {},
  }: {
    board: Board,
    margin?: number,
    on_click?: (tile: Tile) => void,
  } = $props();


  function get_tile(x: number, y: number): Tile {
    const coordinate_data:CoordinateData = `${x},${y}`
    if (coordinate_data in board.tiles) {
      return board.tiles[coordinate_data]
    } else {
      return create_water_tile(coordinate_data)
    }
  }

</script>
<ObjectViewer object={board.data} />

<div class="board">
  {#each iter_range(board.extents.y_min - margin, board.extents.y_max + margin) as y}
    <div class="row">
      {#each iter_range(board.extents.x_min - margin, board.extents.x_max + margin) as x}
        <TileUi
          tile={get_tile(x, y)}
          on_click={() => on_click(get_tile(x, y))}
        />
      {/each}
    </div>
  {/each}
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    gap: 0.25rem;
  }
  .board {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>