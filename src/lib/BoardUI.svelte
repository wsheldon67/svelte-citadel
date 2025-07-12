<script lang="ts">
  import { Board } from '$lib/board.svelte';

  const { board }: { board: Board } = $props();

</script>
{JSON.stringify(board.data, null, 2)}