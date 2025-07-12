<script lang="ts">
  import { Player } from '$lib/player.svelte';
  import EntityUI from '$lib/EntityUI.svelte';

  const { player }: { player: Player } = $props();

</script>
<h2>{player.data.name}</h2>
{#each player.personal_stash as entity}
  <EntityUI {entity} />
{/each}