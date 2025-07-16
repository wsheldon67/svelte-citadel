<script lang="ts">
  import { Game } from '$lib/game.svelte'
  import PlayerUI from './PlayerUI.svelte'
  import BoardUI from './BoardUI.svelte'
  import type { Entity } from './entity.svelte'
  import type { Tile } from './tile.svelte'
  import { RuleViolation } from './errors'

  const { game }: { game: Game } = $props()

  let selected_personal_stash:Entity|null = $state(null)
  let error_message = $state('')

  function on_board_click(tile: Tile) {
    console.log('LandPlacement.on_board_click', tile)
    if (!selected_personal_stash) return
    try {
      selected_personal_stash.do_action('place', tile)
      error_message = ''
    } catch (error) {
      if (error instanceof RuleViolation) error_message = error.message
      else throw error
    }
  }

</script>

{#if game.current_player}
  <p>It is {game.current_player.data.name}'s turn.</p>
{/if}

{error_message}

{#if game.me}
<PlayerUI player={game.me} bind:selected_personal_stash on_personal_stash_click={() => error_message = ''}/>
{:else}
<p>Signed in player is not in this game.</p>
{/if}


<BoardUI board={game.board} on_click={on_board_click} />