<script lang="ts">
  import { page } from '$app/state';
  import GameUI from '$lib/GameUI.svelte';

</script>
<GameUI game_code={page.params.game_code} />