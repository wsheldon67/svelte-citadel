<script lang="ts">
  import { doc, updateDoc } from "firebase/firestore"
  import type { Game } from "./game.svelte"
  import { db } from "./firebase"
  import { GamePhase } from "./data"

  let {
    game
  }: {
    game: Game
  } = $props()

  function start_game(event: MouseEvent) {
    event.preventDefault()
    updateDoc(doc(db, 'games', game.game_code!), {
      phase: GamePhase.LAND_PLACEMENT
    })
  }

</script>
<h1>Lobby</h1>
<p class='game_code'>Game Code: {game.game_code}</p>
<h2>Players</h2>
<ul>
  {#each game.players as player}
    <li>{player.data.name}</li>
  {/each}
</ul>
<button onclick={start_game}>Start Game</button>