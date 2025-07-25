<script lang="ts">
  import BoardUi from '$lib/BoardUI.svelte'
  import { Game } from '$lib/game.svelte'
  import PlayerUi from '$lib/PlayerUI.svelte'
  import { debug } from '$lib/util.svelte'
  import ObjectViewer from '../ObjectViewer.svelte'
  import type { Entity } from '$lib/entity.svelte'

  const { game }: { game: Game } = $props()
  let selected:Entity|null = $state(null)

  let selected_entity = $derived(selected && !game.me?.personal_stash.includes(selected) ? selected : null)
  let selected_personal_stash = $derived(selected && game.me?.personal_stash.includes(selected) ? selected : null)

  let highlighted = $derived(selected ? game.board.tiles.filter(tile => {
    return selected!.has_action_on_tile(tile.x, tile.y)
  }).map(tile => [tile.x, tile.y]) as [number, number][] : [])

</script>
{#if debug()}
  {selected?.actions.map(action => action.action_name)}
  <ObjectViewer object={highlighted} name="Highlighted Tiles" />
{/if}

{#if game.me}
  <PlayerUi player={game.me} {selected_personal_stash} on_personal_stash_click={entity => selected = selected ? null : entity} />
{:else}
  <p>You are not logged into this game.</p>
{/if}

<BoardUi board={game.board}
  on_select_entity={entity => selected = entity}
  {selected_entity}
  {highlighted}
/>