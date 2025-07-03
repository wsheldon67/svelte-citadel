import type { GameData } from "./data";
import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";

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

  constructor(data: GameData) {
    this.data = $state(data);
  }

  static fromConfig(config: GameConfig): Game {
    const initialData: GameData = {
      lands_per_player: config.lands_per_player,
      personal_pieces_per_player: config.personal_pieces_per_player,
      community_pieces_per_player: config.community_pieces_per_player,
      citadels_per_player: config.citadels_per_player,
      players: [],
      board: { name: "Main", tiles: {} },
      turn: 0,
      community_pool: { name: "Community Pool", entities: [] },
      graveyard: { name: "Graveyard", entities: [] },
    };
    return new Game(initialData);
  }

  subscribe(game_code: string):Unsubscribe {
    return onSnapshot(doc(db, "games", game_code), (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as GameData;
        this.data = gameData; // Update the existing game instance
      } else {
        console.error("No such document!");
      }
    });
  }
}