<script lang="ts">
  import { page } from '$app/state'
  import Battle from '$lib/Battle.svelte'
  import LandPlacement from '$lib/LandPlacement.svelte'
  import ObjectViewer from '$lib/ObjectViewer.svelte'
  import { Game, blank_config } from '$lib/game.svelte'
  import { debug } from '$lib/util.svelte'
  import { onMount } from 'svelte'

  let game = $state(Game.fromConfig(blank_config));

  onMount(() => game.subscribe(page.params.game_code));

</script>
{#if debug()}
  <ObjectViewer object={game.data} name="Game Data" />
{/if}
<Battle {game} />
<LandPlacement {game} />