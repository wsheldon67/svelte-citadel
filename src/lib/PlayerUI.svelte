<script lang="ts">
  import { Player } from '$lib/player.svelte'
  import EntityUI from '$lib/EntityUI.svelte'

  const { player }: { player: Player } = $props()

</script>
<h2>{player.data.name}</h2>
<div class="personal-stash">
  {#each player.personal_stash as entity}
    <EntityUI {entity} />
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