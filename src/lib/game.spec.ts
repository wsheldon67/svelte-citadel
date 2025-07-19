
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game, blank_config, blank_game_data } from './game.svelte';
import type { PlayerData } from './data';
import { GamePhase } from './data';

// Mock Firebase dependencies
vi.mock('./firebase', () => ({
  db: {},
  auth: {},
}));
vi.mock('firebase/firestore', () => ({
  arrayRemove: vi.fn((x) => x),
  arrayUnion: vi.fn((x) => x),
  doc: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => () => {}),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  writeBatch: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_, cb) => cb(null)),
}));

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game({ ...blank_game_data });
  });

  it('should construct with blank_game_data', () => {
    expect(game.data).toBeDefined();
    expect(game.data.phase).toBe(GamePhase.LOBBY);
    expect(game.players).toBeDefined();
    expect(game.board).toBeDefined();
  });

  it('should create a Game from config', () => {
    const config = { ...blank_config, lands_per_player: 5 };
    const g = Game.fromConfig(config);
    expect(g.data.lands_per_player).toBe(5);
    expect(g.data.phase).toBe(GamePhase.LOBBY);
  });

  it('should create player data with correct lands and citadels', () => {
    const playerData: PlayerData = game.create_player_data('Alice', 'id123');
    expect(playerData.name).toBe('Alice');
    expect(playerData.id).toBe('id123');
    expect(playerData.personal_stash.entities.filter((e: any) => e.kind === 'Land').length).toBe(game.data.lands_per_player);
    expect(playerData.personal_stash.entities.filter((e: any) => e.kind === 'Citadel').length).toBe(game.data.citadels_per_player);
  });

  it('should throw error if place_entity is called without a signed-in player', () => {
    // Remove current user
    (game as any).me = null;
    const dummyEntity = { data: { kind: 'Land' } };
    const dummyTile = { coordinate_data: '0,0' };
    expect(() => game.place_entity(dummyEntity as any, dummyTile as any)).toThrow();
  });

  it('should throw error if update_game is called without a game code', () => {
    game.game_code = null;
    expect(() => game.update_game()).toThrow();
  });

  it('should subscribe to a game code and update data', () => {
    const unsub = game.subscribe('testcode');
    expect(typeof unsub).toBe('function');
    expect(game.game_code).toBe('testcode');
  });
});
