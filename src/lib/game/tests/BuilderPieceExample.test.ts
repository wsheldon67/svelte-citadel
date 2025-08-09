import { describe, it, expect, beforeEach } from 'vitest';
import { BuilderPiece, BuilderActionFactory } from '../pieces/examples/BuilderPieceExample';
import type { GameState } from '../engine/GameState';
import type { Coordinate } from '../board/Coordinate';

// Helper to create a minimal GameState
function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    pieces: [],
    lands: [],
    graveyard: [],
    ...overrides
  } as GameState;
}

describe('BuilderPiece', () => {
  let state: GameState;
  const playerId = 'player1';
  const builderId = 'builder1';
  const landId = 'land1';
  const builderPos: Coordinate = { x: 2, y: 2 };
  const adjacentPos: Coordinate = { x: 2, y: 3 };
  const farPos: Coordinate = { x: 5, y: 5 };

  beforeEach(() => {
    state = createGameState({
      pieces: [
        { id: builderId, ownerId: playerId, type: 'builder', position: { ...builderPos } }
      ],
      lands: [],
      graveyard: []
    });
  });

  describe('handlePlaceLand', () => {
    it('places land adjacent to builder', () => {
      const action = BuilderActionFactory.createPlaceLandAction(playerId, builderId, landId, adjacentPos.x, adjacentPos.y);
      const newState = BuilderPiece['handlePlaceLand'](state, action);
      expect(newState.lands).toHaveLength(1);
      expect(newState.lands[0]).toMatchObject({ id: landId, position: adjacentPos, ownerId: playerId });
    });

    it('does not place land if not adjacent', () => {
      const action = BuilderActionFactory.createPlaceLandAction(playerId, builderId, landId, farPos.x, farPos.y);
      const newState = BuilderPiece['handlePlaceLand'](state, action);
      expect(newState.lands).toHaveLength(0);
    });

    it('does not place land if position is occupied', () => {
      state.lands.push({ id: 'existing', position: { ...adjacentPos }, ownerId: playerId });
      const action = BuilderActionFactory.createPlaceLandAction(playerId, builderId, landId, adjacentPos.x, adjacentPos.y);
      const newState = BuilderPiece['handlePlaceLand'](state, action);
      expect(newState.lands).toHaveLength(1); // Only the existing land
    });
  });

  describe('handleMoveLand', () => {
    beforeEach(() => {
      state.lands.push({ id: landId, position: { ...adjacentPos }, ownerId: playerId });
    });

    it('moves land to a new position', () => {
      const toPos = { x: 3, y: 3 };
      const action = BuilderActionFactory.createMoveLandAction(playerId, builderId, landId, adjacentPos.x, adjacentPos.y, toPos.x, toPos.y);
      const newState = BuilderPiece['handleMoveLand'](state, action);
      expect(newState.lands.find(l => l.id === landId)?.position).toEqual(toPos);
    });

    it('moves pieces on the land to the new position', () => {
      state.pieces.push({ id: 'piece2', ownerId: playerId, type: 'builder', position: { ...adjacentPos } });
      const toPos = { x: 3, y: 3 };
      const action = BuilderActionFactory.createMoveLandAction(playerId, builderId, landId, adjacentPos.x, adjacentPos.y, toPos.x, toPos.y);
      const newState = BuilderPiece['handleMoveLand'](state, action);
      expect(newState.pieces.find(p => p.id === 'piece2')?.position).toEqual(toPos);
    });
  });

  describe('handleRemoveLand', () => {
    beforeEach(() => {
      state.lands.push({ id: landId, position: { ...adjacentPos }, ownerId: playerId });
    });

    it('removes land and sends pieces to graveyard', () => {
      state.pieces.push({ id: 'piece2', ownerId: playerId, type: 'builder', position: { ...adjacentPos } });
      const action = BuilderActionFactory.createRemoveLandAction(playerId, builderId, landId, adjacentPos.x, adjacentPos.y);
      const newState = BuilderPiece['handleRemoveLand'](state, action);
      expect(newState.lands.find(l => l.id === landId)).toBeUndefined();
      expect(newState.graveyard.find(p => p.id === 'piece2')).toBeDefined();
      expect(newState.graveyard.find(p => p.id === 'piece2')?.position).toBeNull();
    });
  });

  describe('validators', () => {
    it('validatePlaceLand returns true for valid', () => {
      const action = BuilderActionFactory.createPlaceLandAction(playerId, builderId, landId, adjacentPos.x, adjacentPos.y);
      expect(BuilderPiece['validatePlaceLand'](state, action)).toBe(true);
    });
    it('validatePlaceLand returns error for non-adjacent', () => {
      const action = BuilderActionFactory.createPlaceLandAction(playerId, builderId, landId, farPos.x, farPos.y);
      expect(BuilderPiece['validatePlaceLand'](state, action)).toMatch(/adjacent/);
    });
    it('validateMoveLand returns true for valid', () => {
      state.lands.push({ id: landId, position: { ...adjacentPos }, ownerId: playerId });
      const action = BuilderActionFactory.createMoveLandAction(playerId, builderId, landId, adjacentPos.x, adjacentPos.y, 3, 3);
      expect(BuilderPiece['validateMoveLand'](state, action)).toBe(true);
    });
    it('validateRemoveLand returns true for valid', () => {
      state.lands.push({ id: landId, position: { ...adjacentPos }, ownerId: playerId });
      const action = BuilderActionFactory.createRemoveLandAction(playerId, builderId, landId, adjacentPos.x, adjacentPos.y);
      expect(BuilderPiece['validateRemoveLand'](state, action)).toBe(true);
    });
  });
});
