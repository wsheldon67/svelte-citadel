<script lang="ts">
  import { doc, updateDoc } from "firebase/firestore"
  import type { Game } from "../game"
  import { db } from "../firebase"
  import { GamePhase } from "../data"

  let {
    game,
    game_code
  }: {
    game: Game,
    game_code: string
  } = $props()

  function start_game(event: MouseEvent) {
    event.preventDefault()
    updateDoc(doc(db, 'games', game_code), {
      phase: GamePhase.LAND_PLACEMENT
    })
  }

</script>
<h1>Lobby</h1>
<p class='game_code'>Game Code: {game_code}</p>
<h2>Players</h2>
<ul>
  {#each Object.values(game.data.players) as playerData}
    <li>{playerData.name}</li>
  {/each}
</ul>
<button onclick={start_game}>Start Game</button>