<script lang="ts">
  import BoardUi from '$lib/BoardUI.svelte'
  import { Game } from '$lib/game'
  import PlayerUi from '$lib/PlayerUI.svelte'
  import { debug } from '$lib/util.svelte'
  import ObjectViewer from '../ObjectViewer.svelte'
  import type { Entity } from '$lib/entity'
  import type { Tile } from '$lib/tile'
  import type { Action } from '$lib/action'
  import { doc, increment, updateDoc } from 'firebase/firestore'
  import { db } from '$lib/firebase'

  const { game }: { game: Game } = $props()
  let selected:Entity|null = $state(null)
  let message = $state('')
  let floating_action_menu: {
    tile: Tile,
    actions: Action[]
  } | null = $state(null)

  let selected_entity = $derived(selected && !game.me?.personal_stash.includes(selected) ? selected : null)
  let selected_personal_stash = $derived(selected && game.me?.personal_stash.includes(selected) ? selected : null)

  let highlighted = $derived(selected ? game.board.tiles.filter(tile => {
    // TODO: I believe that svelte is complaining when the state on the *copied* game is changed
    // during this computation.
    return selected!.has_action_on_tile(tile.x, tile.y)
  }).map(tile => [tile.x, tile.y]) as [number, number][] : [])

  function on_board_click(tile: Tile) {
    if (!selected) return
    const actions = selected.get_actions_on_tile(tile.x, tile.y)
    if (actions.length == 0) return message = `${selected.data.kind} does not have any valid actions on ${tile.x},${tile.y}.`
    if (actions.length == 1) {
      actions[0].execute(tile, game)
      game.update_game()
      // Weird timing thing. To my understanding:
      // When the parent component updates the `game` prop, this component loses its `selected` state.
      setTimeout(() => { selected = null }, 0)
      return
    }
    floating_action_menu = {tile, actions}
  }

  function floating_action_menu_click(action: Action) {
    if (floating_action_menu) {
      action.execute(floating_action_menu.tile, game)
      floating_action_menu = null
      game.update_game()
      setTimeout(() => { selected = null }, 0)
    }
  }

  function advance_turn() {
    updateDoc(doc(db, 'games', game.game_code!), {
      turn: increment(1)
    })
  }

</script>
{#if debug()}
  {selected?.actions.map(action => action.action_name)}
  <ObjectViewer object={highlighted} name="Highlighted Tiles" />
  <button onclick={advance_turn}>Advance Turn</button>
{/if}

{#if game.me}
  <PlayerUi player={game.me}
    {selected_personal_stash}
    on_personal_stash_click={entity => selected = selected ? null : entity}
    is_current_player={game.me === game.current_player}
  />
{:else}
  <p>You are not logged into this game.</p>
{/if}

<BoardUi board={game.board}
  on_select_entity={entity => selected = entity}
  {selected_entity}
  {highlighted}
  on_click={on_board_click}
/>

{#if floating_action_menu}
  <div class="floating-action-menu">
    {#each floating_action_menu.actions as action}
      <button onclick={() => floating_action_menu_click(action)}>
        {action.action_name}
      </button>
    {/each}
  </div>
{/if}

{#if message}
  <p class="message">{message}</p>
{/if}