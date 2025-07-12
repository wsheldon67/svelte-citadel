<script lang="ts">
  import { goto } from '$app/navigation';
  import { db, auth } from '$lib/firebase'
  import { Game, type GameConfig } from '$lib/game.svelte'
  import { doc, setDoc } from 'firebase/firestore';
  import { generateCode } from '$lib/util';
    import { Player } from '$lib/player.svelte';

  let gameCode = $state('')

  async function join_game(event: SubmitEvent) {

  }

  let gameConfig:GameConfig = $state({
    lands_per_player: 4,
    personal_pieces_per_player: 3,
    community_pieces_per_player: 2,
    citadels_per_player: 1,
  })

  async function start_game(event: SubmitEvent) {
    event.preventDefault()

    if (!auth.currentUser) {
      throw new Error('No user signed in.')
    }

    const game = Game.fromConfig(gameConfig)

    game.data.players.push(Player.from_config({
      name: auth.currentUser.displayName || 'Anonymous',
      id: auth.currentUser.uid,
      lands_per_player: gameConfig.lands_per_player,
      citadels_per_player: gameConfig.citadels_per_player,
    }).data)

    gameCode = generateCode()
    console.log($state.snapshot(game.data))
    await setDoc(doc(db, 'games', gameCode), game.data)
    goto(`/${gameCode}`)
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
<form onsubmit={start_game}>
  <label>
    Personal Pieces per Player:
    <input type="number" min="1" max="10" bind:value={gameConfig.personal_pieces_per_player}>
  </label>
  <label>
    Community Pieces per Player:
    <input type="number" min="1" max="10" bind:value={gameConfig.community_pieces_per_player}>
  </label>
  <label>
    Lands per Player:
    <input type="number" min="1" max="10" bind:value={gameConfig.lands_per_player}>
  </label>
  <label>
    Citadels per Player:
    <input type="number" min="1" max="10" bind:value={gameConfig.citadels_per_player}>
  </label>
  <button type="submit">Start Game</button>
</form>