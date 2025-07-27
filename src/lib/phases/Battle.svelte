<script lang="ts">
  import BoardUi from '$lib/BoardUI.svelte'
  import { Game } from '$lib/game.svelte'
  import PlayerUi from '$lib/PlayerUI.svelte'
  import { debug } from '$lib/util.svelte'
  import ObjectViewer from '../ObjectViewer.svelte'
  import type { Entity } from '$lib/entity.svelte'
  import type { Tile } from '$lib/tile.svelte'
  import type { Action } from '$lib/action'

  const { game }: { game: Game } = $props()
  let selected:Entity|null = $state(null)
  let message = $state('')
  let floating_action_menu: {
    tile: Tile,
    actions: Action[]
  } | null = $state(null)

  let selected_entity = $derived(selected && game.me?.personal_stash.includes(selected) ? selected : null)
  let selected_personal_stash = $derived(selected && game.me?.personal_stash.includes(selected) ? selected : null)

  let highlighted = $derived(selected ? game.board.tiles.filter(tile => {
    return selected!.has_action_on_tile(tile.x, tile.y)
  }).map(tile => [tile.x, tile.y]) as [number, number][] : [])

  function on_click_with_selected(tile: Tile, entity: Entity) {
    const actions = entity.get_actions_on_tile(tile.x, tile.y)
    if (actions.length == 0) return message = `${entity.data.kind} does not have any valid actions on ${tile.x},${tile.y}.`
    if (actions.length == 1) {
      actions[0].execute(tile, game)
      game.update_game()
      return
    }
    floating_action_menu = {tile, actions}
  }

  function floating_action_menu_click(action: Action) {
    if (floating_action_menu) {
      action.execute(floating_action_menu.tile, game)
      floating_action_menu = null
    }
  }

</script>
{#if debug()}
  {selected?.actions.map(action => action.action_name)}
  <ObjectViewer object={highlighted} name="Highlighted Tiles" />
{/if}

{#if game.me}
  <PlayerUi player={game.me}
    {selected_personal_stash}
    on_personal_stash_click={entity => selected = selected ? null : entity}
  />
{:else}
  <p>You are not logged into this game.</p>
{/if}

<BoardUi board={game.board}
  on_select_entity={entity => selected = entity}
  {selected_entity}
  {highlighted}
  {on_click_with_selected}
/>

{#if floating_action_menu}
  <div class="floating-action-menu">
    {#each floating_action_menu.actions as action}
      <button onclick={() => floating_action_menu_click(action)}>
        {action.name}
      </button>
    {/each}
  </div>
{/if}

{#if message}
  <p class="message">{message}</p>
{/if}