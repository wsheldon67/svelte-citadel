<script lang="ts">
  import { db, auth } from '$lib/firebase'

  let gameCode: string = ''

  async function start_game(event: SubmitEvent) {

  }

</script>
<h1>Welcome to Citadel</h1>

<form>
  <label>
    Game Code:
    <input type="text" bind:value={gameCode} >
  </label>
  <button type="submit" >
    Join Game
  </button>
</form>
<form on:submit|preventDefault={start_game}>
  <button type="submit">Start Game</button>
</form>