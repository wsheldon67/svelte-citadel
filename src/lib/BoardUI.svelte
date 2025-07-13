<script lang="ts">
  import { Board } from '$lib/board.svelte';

  const { board }: { board: Board } = $props();

</script>
{JSON.stringify(board.data, null, 2)}

{#each Array.from({ length: board.extents.y + 3}) as _, y}
  <div class="row">
    {#each Array.from({ length: board.extents.x + 3}) as _, x}
      <div class="tile">
        {board.tiles[`${x},${y}`]?.data?.name || 'Empty'}
      </div>
    {/each}
  </div>
{/each}