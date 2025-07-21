<script lang="ts">
    import { GamePhase } from "$lib/data";
  import type { Entity } from "$lib/entity.svelte"
  import EntitySelector from "$lib/EntitySelector.svelte"
  import { db } from "$lib/firebase"
  import type { Game } from "$lib/game.svelte"
  import PlayerUI from "$lib/PlayerUI.svelte"
  import { generate_code } from "$lib/util"
  import { arrayUnion, doc, updateDoc } from "firebase/firestore"

  const { game }: { game: Game } = $props()

  function on_select(kind: string, EntityType: typeof Entity) {
    updateDoc(doc(db, 'games', game.game_code!), {
      [`players.${game.me!.data.id}.personal_stash.entities`]: arrayUnion({
        kind, created_by: game.me!.data.id, id: generate_code(6)
      })
    })
  }

  async function confirm_selection(event: MouseEvent) {
    event.preventDefault()
    await updateDoc(doc(db, 'games', game.game_code!), {
      [`players.${game.me!.data.id}.piece_selection_confirmed`]: true
    })
    if (game.players.every(player => player.data.piece_selection_confirmed)) {
      await updateDoc(doc(db, 'games', game.game_code!), {
        game_phase: GamePhase.BATTLE
      })
    }
  }

</script>
{#if game.me}
  <PlayerUI player={game.me} />
  <p>Community pieces: {game.me.community_pieces.length}</p>
{:else}
  <p>You are not logged into this game.</p>
{/if}
<!-- Finish this up for community pieces, start by implementing player.is_done_choosing_pieces -->
{#if game.me && game.me.personal_stash.length >= game.data.personal_pieces_per_player}
  {#if !game.me.data.piece_selection_confirmed}
    <button onclick={confirm_selection}>Confirm Selection</button>
  {:else}
    <p>Waiting for other players.</p>
  {/if}
{:else}
  <p>Select {game.data.personal_pieces_per_player} personal pieces:</p>
  <EntitySelector entity_types={game.piece_types} {on_select} />
  <p>Select {game.data.community_pieces_per_player} community pieces:</p>
  <EntitySelector entity_types={game.piece_types} {on_select} />
{/if}