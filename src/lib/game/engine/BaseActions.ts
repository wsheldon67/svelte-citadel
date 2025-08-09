import type { Coordinate } from '../board/Coordinate';

/**
 * Base interface that all game actions must implement
 * This is the minimal contract for any action in the system
 */
export interface BaseGameAction {
  /** Unique identifier for this action */
  id: string;
  
  /** Timestamp when action was created */
  timestamp: number;
  
  /** ID of the player who performed this action */
  playerId: string;
  
  /** Type of action - should be unique across the system */
  type: string;
  
  /** Optional piece ID if this action is performed by a specific piece */
  pieceId?: string;
}

/**
 * Core system actions that every game needs
 * These are always available and don't need to be registered
 */

export interface JoinGameAction extends BaseGameAction {
  type: 'join-game';
  playerName: string;
  artSetId?: string;
}

export interface StartGameAction extends BaseGameAction {
  type: 'start-game';
}

export interface PlaceLandAction extends BaseGameAction {
  type: 'place-land';
  position: Coordinate;
  landId: string;
}

export interface PlaceCitadelAction extends BaseGameAction {
  type: 'place-citadel';
  position: Coordinate;
  citadelId: string;
}

export interface SelectPieceAction extends BaseGameAction {
  type: 'select-piece';
  pieceType: string; // Changed from PieceType to string for flexibility
  destination: 'personal' | 'community';
  pieceId: string;
}

export interface PlacePieceAction extends BaseGameAction {
  type: 'place-piece';
  pieceId: string;
  position: Coordinate;
  source: 'personal' | 'community';
}

export interface EndTurnAction extends BaseGameAction {
  type: 'end-turn';
}

export interface ConcedeAction extends BaseGameAction {
  type: 'concede';
}

/**
 * Common piece actions that most pieces will use
 * These are provided for convenience but pieces can define their own
 */

export interface MovePieceAction extends BaseGameAction {
  type: 'move-piece';
  pieceId: string;
  fromPosition: Coordinate;
  toPosition: Coordinate;
  moveData?: Record<string, unknown>;
}

export interface CapturePieceAction extends BaseGameAction {
  type: 'capture-piece';
  capturingPieceId: string;
  capturedPieceId: string;
  position: Coordinate;
}

/**
 * Core system actions that are always available
 */
export type CoreGameAction = 
  | JoinGameAction
  | StartGameAction
  | PlaceLandAction
  | PlaceCitadelAction
  | SelectPieceAction
  | PlacePieceAction
  | EndTurnAction
  | ConcedeAction;

/**
 * Common piece actions
 */
export type CommonPieceAction = 
  | MovePieceAction
  | CapturePieceAction;

/**
 * Type for any valid game action (will be extended by piece-specific actions)
 */
export type GameAction = BaseGameAction;

/**
 * Utility functions for creating actions
 */
export const ActionUtils = {
  /**
   * Generate a unique action ID
   */
  generateId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Create base action data
   */
  createBase(type: string, playerId: string, pieceId?: string): BaseGameAction {
    return {
      id: ActionUtils.generateId(),
      timestamp: Date.now(),
      playerId,
      type,
      pieceId
    };
  },

  /**
   * Create a move action
   */
  createMoveAction(
    playerId: string,
    pieceId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    moveData?: Record<string, unknown>
  ): MovePieceAction {
    return {
      ...ActionUtils.createBase('move-piece', playerId, pieceId),
      type: 'move-piece',
      pieceId,
      fromPosition: { x: fromX, y: fromY },
      toPosition: { x: toX, y: toY },
      moveData
    };
  },

  /**
   * Create a capture action
   */
  createCaptureAction(
    playerId: string,
    capturingPieceId: string,
    capturedPieceId: string,
    x: number,
    y: number
  ): CapturePieceAction {
    return {
      ...ActionUtils.createBase('capture-piece', playerId, capturingPieceId),
      type: 'capture-piece',
      capturingPieceId,
      capturedPieceId,
      position: { x, y }
    };
  }
};
