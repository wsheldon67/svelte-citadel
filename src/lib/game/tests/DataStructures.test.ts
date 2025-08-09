import { describe, it, expect } from 'vitest';
import { GameFactory, ActionFactory } from '../engine/GameFactory';
import { GameStateDerivation } from '../engine/GameStateDerivation';
import { CoordinateUtils } from '../board/Coordinate';
import { IdUtils, ValidationUtils } from '../utils/GameUtils';

describe('Game Data Structures', () => {
  describe('Coordinate System', () => {
    it('should create coordinates correctly', () => {
      const coord = CoordinateUtils.create(5, 10);
      expect(coord).toEqual({ x: 5, y: 10 });
    });

    it('should convert coordinates to/from string keys', () => {
      const coord = { x: -3, y: 7 };
      const key = CoordinateUtils.toKey(coord);
      expect(key).toBe('-3,7');
      
      const parsed = CoordinateUtils.fromKey(key);
      expect(parsed).toEqual(coord);
    });

    it('should correctly identify adjacent coordinates', () => {
      const center = { x: 0, y: 0 };
      const adjacent = CoordinateUtils.getOrthogonalAdjacent(center);
      
      expect(adjacent).toHaveLength(4);
      expect(adjacent).toContainEqual({ x: 0, y: -1 }); // up
      expect(adjacent).toContainEqual({ x: 0, y: 1 });  // down
      expect(adjacent).toContainEqual({ x: -1, y: 0 }); // left
      expect(adjacent).toContainEqual({ x: 1, y: 0 });  // right
    });

    it('should calculate Manhattan distance correctly', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      const distance = CoordinateUtils.manhattanDistance(a, b);
      expect(distance).toBe(7);
    });
  });

  describe('Game Factory', () => {
    it('should create initial game state with defaults', () => {
      const hostId = 'player_123';
      const initialState = GameFactory.createInitialGameState(hostId);
      
      expect(initialState.hostPlayerId).toBe(hostId);
      expect(initialState.config.landsPerPlayer).toBe(3);
      expect(initialState.config.maxPlayers).toBe(2);
      expect(initialState.config.gameMode).toBe('standard');
      expect(initialState.joinCode).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should create game document', () => {
      const hostId = 'player_123';
      const gameDoc = GameFactory.createGameDocument(hostId);
      
      expect(gameDoc.initialState.hostPlayerId).toBe(hostId);
      expect(gameDoc.actions).toEqual([]);
      expect(gameDoc.version).toBe(1);
      
      // Test derived state
      const currentState = GameStateDerivation.deriveState(gameDoc.initialState, gameDoc.actions);
      expect(currentState.phase).toBe('setup');
    });

    it('should create player correctly', () => {
      const player = GameFactory.createPlayer('Alice', true, 1);
      
      expect(player.name).toBe('Alice');
      expect(player.isHost).toBe(true);
      expect(player.turnOrder).toBe(1);
      expect(player.personalStash).toEqual([]);
      expect(player.id).toMatch(/^player_/);
    });
  });

  describe('Action Factory', () => {
    it('should create join game action', () => {
      const playerId = 'player_123';
      const action = ActionFactory.createJoinGameAction(playerId, 'Alice');
      
      expect(action.type).toBe('join-game');
      expect(action.playerId).toBe(playerId);
      expect(action.playerName).toBe('Alice');
      expect(action.timestamp).toBeGreaterThan(0);
    });

    it('should create place land action', () => {
      const playerId = 'player_123';
      const action = ActionFactory.createPlaceLandAction(playerId, 5, 10);
      
      expect(action.type).toBe('place-land');
      expect(action.position).toEqual({ x: 5, y: 10 });
      expect(action.landId).toMatch(/^land_/);
    });

    it('should create move piece action', () => {
      const playerId = 'player_123';
      const pieceId = 'piece_456';
      const action = ActionFactory.createMovePieceAction(
        playerId, pieceId, 0, 0, 1, 1
      );
      
      expect(action.type).toBe('move-piece');
      expect(action.pieceId).toBe(pieceId);
      expect(action.fromPosition).toEqual({ x: 0, y: 0 });
      expect(action.toPosition).toEqual({ x: 1, y: 1 });
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs with correct prefixes', () => {
      const gameId = IdUtils.generateGameId();
      const playerId = IdUtils.generatePlayerId();
      const pieceId = IdUtils.generatePieceId();
      
      expect(gameId).toMatch(/^game_\d+_[a-z0-9]{9}$/);
      expect(playerId).toMatch(/^player_\d+_[a-z0-9]{9}$/);
      expect(pieceId).toMatch(/^piece_\d+_[a-z0-9]{9}$/);
    });

    it('should generate valid join codes', () => {
      const joinCode = IdUtils.generateJoinCode();
      expect(joinCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(ValidationUtils.isValidJoinCode(joinCode)).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate player names', () => {
      expect(ValidationUtils.isValidPlayerName('Alice')).toBe(true);
      expect(ValidationUtils.isValidPlayerName('  Bob  ')).toBe(true);
      expect(ValidationUtils.isValidPlayerName('')).toBe(false);
      expect(ValidationUtils.isValidPlayerName('   ')).toBe(false);
    });

    it('should validate coordinate keys', () => {
      expect(ValidationUtils.isValidCoordinateKey('0,0')).toBe(true);
      expect(ValidationUtils.isValidCoordinateKey('-5,10')).toBe(true);
      expect(ValidationUtils.isValidCoordinateKey('1.5,2')).toBe(false);
      expect(ValidationUtils.isValidCoordinateKey('invalid')).toBe(false);
    });
  });

  describe('State Derivation', () => {
    it('should derive initial state correctly', () => {
      const hostId = 'player_host';
      const gameDoc = GameFactory.createGameDocument(hostId);
      
      const derivedState = GameStateDerivation.deriveState(gameDoc.initialState, []);
      
      expect(derivedState.id).toBe(gameDoc.initialState.id);
      expect(derivedState.phase).toBe('setup');
      expect(derivedState.players).toEqual([]);
      expect(derivedState.lands).toEqual([]);
      expect(derivedState.pieces).toEqual([]);
    });

    it('should apply join game action', () => {
      const hostId = 'player_host';
      const gameDoc = GameFactory.createGameDocument(hostId);
      
      const joinAction = ActionFactory.createJoinGameAction('player_alice', 'Alice');
      const actions = [joinAction];
      
      const derivedState = GameStateDerivation.deriveState(gameDoc.initialState, actions);
      
      expect(derivedState.players).toHaveLength(1);
      expect(derivedState.players[0].name).toBe('Alice');
      expect(derivedState.players[0].id).toBe('player_alice');
    });

    it('should apply multiple actions in sequence', () => {
      const hostId = 'player_host';
      const gameDoc = GameFactory.createGameDocument(hostId);
      
      const actions = [
        ActionFactory.createJoinGameAction('player_alice', 'Alice'),
        ActionFactory.createJoinGameAction('player_bob', 'Bob'),
        ActionFactory.createStartGameAction('player_alice')
      ];
      
      const derivedState = GameStateDerivation.deriveState(gameDoc.initialState, actions);
      
      expect(derivedState.players).toHaveLength(2);
      expect(derivedState.phase).toBe('land-placement');
      expect(derivedState.currentPlayerId).toBe('player_alice');
    });

    it('should handle land placement', () => {
      const hostId = 'player_host';
      const gameDoc = GameFactory.createGameDocument(hostId);
      
      const actions = [
        ActionFactory.createJoinGameAction('player_alice', 'Alice'),
        ActionFactory.createStartGameAction('player_alice'),
        ActionFactory.createPlaceLandAction('player_alice', 0, 0)
      ];
      
      const derivedState = GameStateDerivation.deriveState(gameDoc.initialState, actions);
      
      expect(derivedState.lands).toHaveLength(1);
      expect(derivedState.lands[0].position).toEqual({ x: 0, y: 0 });
      expect(derivedState.lands[0].ownerId).toBe('player_alice');
    });
  });
});
