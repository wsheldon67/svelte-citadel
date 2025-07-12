<script lang="ts">
  import { Player } from '$lib/player.svelte';

  const { player }: { player: Player } = $props();

</script>
<h2>{player.data.name}</h2>