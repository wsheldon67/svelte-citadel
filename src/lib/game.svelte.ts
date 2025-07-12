import type { GameData } from "./data";
import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db, auth } from "./firebase";
import { Player } from './player.svelte'
import { Board } from './board.svelte';
import { onAuthStateChanged, type User } from "firebase/auth";

export type GameConfig = {
  lands_per_player: number;
  personal_pieces_per_player: number;
  community_pieces_per_player: number;
  citadels_per_player: number;
};

export const blank_config: GameConfig = {
  lands_per_player: 5,
  personal_pieces_per_player: 5,
  community_pieces_per_player: 5,
  citadels_per_player: 1,
};

export class Game {
  public data: GameData;
  public players: Player[];
  public current_user: User | null;
  public me: Player | null;
  public board: Board;

  constructor(data: GameData) {
    this.data = $state(data);
    this.players = $derived(
      this.data.players.map(playerData => new Player(playerData))
    );
    this.current_user = $state(null);
    this.me = $derived(
      this.current_user && this.players ? this.players.find(player => player.data.id === this.current_user?.uid) || null : null
    )
    this.board = $derived(new Board(this.data.board));

    onAuthStateChanged(auth, user => this.current_user = user);
    // @ts-ignore
    window.game = this; // For debugging purposes
  }

  static fromConfig(config: GameConfig): Game {
    const initial_data: GameData = {
      ...config,
      players: [],
      board: { name: "Main", tiles: {} },
      turn: 0,
      community_pool: { name: "Community Pool", entities: [] },
      graveyard: { name: "Graveyard", entities: [] },
    };
    return new Game(initial_data);
  }

  subscribe(game_code: string):Unsubscribe {
    console.log("Subscribing to game:", game_code);
    return onSnapshot(doc(db, "games", game_code), (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as GameData;
        console.log(gameData);
        this.data = gameData; // Update the existing game instance
      } else {
        console.error("No such document!");
      }
    });
  }

}