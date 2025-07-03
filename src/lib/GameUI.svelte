<script lang="ts">
  import { Game, blank_config } from '$lib/game.svelte';
  import { onMount } from 'svelte';

  let { game_code }: { game_code: string } = $props();
  let game = Game.fromConfig(blank_config);

  onMount(game.subscribe(game_code));
</script>
{JSON.stringify(game.data)}