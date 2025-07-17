<script lang="ts">
    import { goto } from "$app/navigation";
    import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
    import { auth, db } from "./firebase";
    import { Player } from "./player.svelte";
    import { GamePhase, type GameData } from "./data";
    import { onMount } from "svelte";
    import { generate_name } from "./name_generator";
    import { Game } from "./game.svelte";

  let game_code = $state('')
  let player_name = $state('')
  let message = $state('')

  async function join_game(event: SubmitEvent) {
    event.preventDefault()
    if (!game_code || !player_name) return
    if (!auth.currentUser) {
      throw new Error('No user signed in.')
    }

    const game_snap = await getDoc(doc(db, 'games', game_code))
    if (!game_snap.exists()) {
      message = 'Game not found. Please check the game code.'
      return
    }

    const game_data: GameData = game_snap.data() as GameData

    if (game_data.phase !== GamePhase.LOBBY) {
      message = 'Game has already started.'
      return
    }

    const game = new Game(game_data)

    updateDoc(doc(db, 'games', game_code), {
      [`players.${auth.currentUser.uid}`]: game.create_player_data(
        player_name, auth.currentUser.uid
      )
    })

    goto(`/${game_code}`)
  }

  onMount(() => {
    player_name = auth.currentUser?.displayName || generate_name()
  })
</script>
<p>{message}</p>
<form onsubmit={join_game}>
  <label>
    Game Code:
    <input type="text" bind:value={game_code} >
  </label>
  <label>
    Display Name:
    <input type="text" bind:value={player_name} >
  </label>
  <button type="submit" >
    Join Game
  </button>
</form>