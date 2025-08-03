<script lang="ts">
  import { Game } from '$lib/game'
  import PlayerUI from '../PlayerUI.svelte'
  import BoardUI from '../BoardUI.svelte'
  import type { Entity } from '../entity'
  import type { Tile } from '../tile'
  import { RuleViolation } from '../errors'
  import { doc, updateDoc } from 'firebase/firestore'
  import { db } from '../firebase'
  import { GamePhase } from '../data'

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

  async function start_piece_selection(event: MouseEvent) {
    event.preventDefault()

    updateDoc(doc(db, 'games', game.game_code!), {
      phase: GamePhase.PIECE_SELECTION
    })
  }

</script>

{#if game.current_player}
  <p>It is {game.current_player.data.name}'s turn.</p>
{/if}

{error_message}

{#if game.me}
<PlayerUI player={game.me}
  on_personal_stash_click={(entity) => { selected_personal_stash = entity; error_message = ''; }}
  {selected_personal_stash}
/>
{:else}
<p>Signed in player is not in this game.</p>
{/if}

<BoardUI board={game.board} on_click={on_board_click} />

{#if game.all_personal_stashes.length == 0}
  <button onclick={start_piece_selection}>Continue</button>
{/if}