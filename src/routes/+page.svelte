<script lang="ts">
  import { goto } from '$app/navigation'
  import { db, auth } from '$lib/firebase'
  import { blank_config, Game, type GameConfig } from '$lib/game'
  import { doc, setDoc } from 'firebase/firestore'
  import { generate_code } from '$lib/util'
  import { onMount } from 'svelte'
  import { generate_name } from '$lib/name_generator'
  import JoinGame from '$lib/JoinGame.svelte'

  let game_code = $state('')
  let player_name = $state('')

  let game_config:GameConfig = $state(blank_config)

  async function start_game(event: SubmitEvent) {
    event.preventDefault()

    if (!auth.currentUser) {
      throw new Error('No user signed in.')
    }

    const game = Game.fromConfig(game_config)

    game.data.players[auth.currentUser.uid] = game.create_player_data(
      player_name, auth.currentUser.uid,
    )

    game_code = generate_code()
    console.log($state.snapshot(game.data))
    await setDoc(doc(db, 'games', game_code), game.data)
    goto(`/${game_code}`)
  }

  onMount(() => {
    player_name = auth.currentUser?.displayName || generate_name()
  })

</script>
<h1>Welcome to Citadel</h1>

<JoinGame />
<form onsubmit={start_game}>
  <label>
    Personal Pieces per Player:
    <input type="number" min="1" max="10" bind:value={game_config.personal_pieces_per_player}>
  </label>
  <label>
    Community Pieces per Player:
    <input type="number" min="1" max="10" bind:value={game_config.community_pieces_per_player}>
  </label>
  <label>
    Lands per Player:
    <input type="number" min="1" max="10" bind:value={game_config.lands_per_player}>
  </label>
  <label>
    Citadels per Player:
    <input type="number" min="1" max="10" bind:value={game_config.citadels_per_player}>
  </label>
  <label>
    Display Name:
    <input type="text" bind:value={player_name} placeholder="Your Name" required>
  </label>
  <button type="submit">Start Game</button>
</form>