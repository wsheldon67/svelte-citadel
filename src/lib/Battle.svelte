<script lang="ts">
  import { Game } from '$lib/game.svelte';

  const { game }: { game: Game } = $props();

</script>
{JSON.stringify(game.data)}