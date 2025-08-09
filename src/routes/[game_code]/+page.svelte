<script lang="ts">
  import { page } from '$app/state'
  import Battle from '$lib/phases/Battle.svelte'
  import LandPlacement from '$lib/phases/LandPlacement.svelte'
  import ObjectViewer from '$lib/ObjectViewer.svelte'
  import { Game, blank_config } from '$lib/game'
  import { debug } from '$lib/util.svelte'
  import { onMount } from 'svelte'
  import { GamePhase } from '$lib/data'
  import LobbyUI from '$lib/phases/LobbyUI.svelte'
  import PieceSelection from '$lib/phases/PieceSelection.svelte'

  let game = $state(Game.fromConfig(blank_config))

  onMount(() => game.subscribe(page.params.game_code))

  

</script>
{#if debug()}
  <ObjectViewer object={game.data} name="Game Data" />
{/if}

{#if game.data.phase === GamePhase.LOBBY}
  <LobbyUI {game} game_code={page.params.game_code} />
{:else if game.data.phase === GamePhase.LAND_PLACEMENT}
  <LandPlacement {game} />
{:else if game.data.phase === GamePhase.PIECE_SELECTION}
  <PieceSelection {game} />
{:else if game.data.phase === GamePhase.BATTLE}
  <Battle {game} />
{:else if game.data.phase === GamePhase.END}
  <div>Game Over</div>
{/if}