<script lang="ts">
  import { Game } from '$lib/game.svelte'
  import PlayerUI from './PlayerUI.svelte'
  import BoardUI from './BoardUI.svelte'
  import type { Entity } from './entity.svelte'
  import type { Tile } from './tile.svelte'

  const { game }: { game: Game } = $props()

  let selected_personal_stash:Entity|null = $state(null)

  function on_board_click(tile: Tile) {
    if (!selected_personal_stash) return
    game.place_entity(selected_personal_stash, tile)
  }

</script>

{#if game.current_player}
  <p>It is {game.current_player?.data?.name}'s turn.</p>
{/if}

{#if game.me}
<PlayerUI player={game.me} bind:selected_personal_stash />
{:else}
<p>Signed in player is not in this game.</p>
{/if}


<BoardUI board={game.board} on_click={on_board_click} />