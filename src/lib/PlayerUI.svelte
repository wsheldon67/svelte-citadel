<script lang="ts">
  import { Player } from '$lib/player.svelte'
  import EntityUI from '$lib/EntityUI.svelte'
  import type { Entity } from './entity.svelte'

  let {
    player,
    on_personal_stash_click = () => {},
    selected_personal_stash = null,
  }: {
    player: Player,
    on_personal_stash_click?: (entity: Entity) => void,
    selected_personal_stash?: Entity | null,
  } = $props()

  function handle_personal_stash_click(entity: Entity) {
    console.log('Personal stash clicked:', entity)
    on_personal_stash_click(entity)
  }

</script>
<h2>{player.data.name}</h2>
<div class="personal-stash">
  {#each player.personal_stash.entities as entity}
    <EntityUI {entity}
      on_click={() => handle_personal_stash_click(entity)}
      selected={selected_personal_stash === entity}
    />
  {/each}
</div>

<style>
  .personal-stash {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>