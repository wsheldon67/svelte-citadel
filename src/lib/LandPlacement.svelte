<script lang="ts">
  import { Game } from '$lib/game.svelte';
  import PlayerUI from './PlayerUI.svelte';
  import BoardUI from './BoardUI.svelte';
  
  const { game }: { game: Game } = $props();
</script>

{#if game.me}
<PlayerUI player={game.me} />
{/if}

{#if game.board}
<BoardUI board={game.board} />
{/if}