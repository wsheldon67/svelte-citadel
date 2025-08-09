import type { Coordinate } from '../board/Coordinate.js';
import type { PieceType } from './GameState.js';

/**
 * Base interface for all game actions
 */
export interface BaseGameAction {
  /** Unique identifier for this action */
  id: string;
  
  /** Timestamp when action was created */
  timestamp: number;
  
  /** ID of the player who performed this action */
  playerId: string;
  
  /** Type of action */
  type: string;
}

/**
 * Action for a player joining the game during setup
 */
export interface JoinGameAction extends BaseGameAction {
  type: 'join-game';
  playerName: string;
  artSetId?: string;
}

/**
 * Action for starting the game (moving from setup to land-placement)
 */
export interface StartGameAction extends BaseGameAction {
  type: 'start-game';
}

/**
 * Action for placing a land tile during setup phase
 */
export interface PlaceLandAction extends BaseGameAction {
  type: 'place-land';
  position: Coordinate;
  landId: string;
}

/**
 * Action for placing a citadel during setup phase
 */
export interface PlaceCitadelAction extends BaseGameAction {
  type: 'place-citadel';
  position: Coordinate;
  citadelId: string;
}

/**
 * Action for selecting pieces for personal stash or community pool
 */
export interface SelectPieceAction extends BaseGameAction {
  type: 'select-piece';
  pieceType: PieceType;
  destination: 'personal' | 'community';
  pieceId: string;
}

/**
 * Action for placing a piece on the board
 */
export interface PlacePieceAction extends BaseGameAction {
  type: 'place-piece';
  pieceId: string;
  position: Coordinate;
  source: 'personal' | 'community';
}

/**
 * Action for moving a piece
 */
export interface MovePieceAction extends BaseGameAction {
  type: 'move-piece';
  pieceId: string;
  fromPosition: Coordinate;
  toPosition: Coordinate;
  /** Additional data for complex moves */
  moveData?: Record<string, unknown>;
}

/**
 * Action for capturing a piece
 */
export interface CapturePieceAction extends BaseGameAction {
  type: 'capture-piece';
  capturingPieceId: string;
  capturedPieceId: string;
  position: Coordinate;
}

/**
 * Action for Builder placing a land tile
 */
export interface BuilderPlaceLandAction extends BaseGameAction {
  type: 'builder-place-land';
  builderId: string;
  landId: string;
  position: Coordinate;
}

/**
 * Action for Builder moving a land tile
 */
export interface BuilderMoveLandAction extends BaseGameAction {
  type: 'builder-move-land';
  builderId: string;
  landId: string;
  fromPosition: Coordinate;
  toPosition: Coordinate;
}

/**
 * Action for Builder removing a land tile
 */
export interface BuilderRemoveLandAction extends BaseGameAction {
  type: 'builder-remove-land';
  builderId: string;
  landId: string;
  position: Coordinate;
}

/**
 * Action for Bomber exploding
 */
export interface BomberExplodeAction extends BaseGameAction {
  type: 'bomber-explode';
  bomberId: string;
  position: Coordinate;
  affectedPieceIds: string[];
}

/**
 * Action for Necromancer resurrecting a piece
 */
export interface NecromancerResurrectAction extends BaseGameAction {
  type: 'necromancer-resurrect';
  necromancerId: string;
  resurrectedPieceId: string;
  position: Coordinate;
}

/**
 * Action for Assassin declaring a target
 */
export interface AssassinDeclareTargetAction extends BaseGameAction {
  type: 'assassin-declare-target';
  assassinId: string;
  targetPieceId: string;
}

/**
 * Action for Turtle picking up or dropping a piece
 */
export interface TurtleCarryAction extends BaseGameAction {
  type: 'turtle-carry';
  turtleId: string;
  carriedPieceId: string | null; // null means drop
  action: 'pickup' | 'drop';
}

/**
 * Action for ending the current player's turn
 */
export interface EndTurnAction extends BaseGameAction {
  type: 'end-turn';
}

/**
 * Action for conceding the game
 */
export interface ConcedeAction extends BaseGameAction {
  type: 'concede';
}

/**
 * Union type of all possible game actions
 */
export type GameAction = 
  | JoinGameAction
  | StartGameAction
  | PlaceLandAction
  | PlaceCitadelAction
  | SelectPieceAction
  | PlacePieceAction
  | MovePieceAction
  | CapturePieceAction
  | BuilderPlaceLandAction
  | BuilderMoveLandAction
  | BuilderRemoveLandAction
  | BomberExplodeAction
  | NecromancerResurrectAction
  | AssassinDeclareTargetAction
  | TurtleCarryAction
  | EndTurnAction
  | ConcedeAction;

/**
 * Utility functions for working with game actions
 */
export const GameActionUtils = {
  /**
   * Create a unique action ID
   */
  generateId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Create base action data
   */
  createBase(type: string, playerId: string): BaseGameAction {
    return {
      id: GameActionUtils.generateId(),
      timestamp: Date.now(),
      playerId,
      type
    };
  },

  /**
   * Check if action is a movement action
   */
  isMovementAction(action: GameAction): action is MovePieceAction {
    return action.type === 'move-piece';
  },

  /**
   * Check if action is a placement action
   */
  isPlacementAction(action: GameAction): action is PlacePieceAction | PlaceLandAction | PlaceCitadelAction {
    return action.type === 'place-piece' || action.type === 'place-land' || action.type === 'place-citadel';
  },

  /**
   * Check if action is a capture action
   */
  isCaptureAction(action: GameAction): action is CapturePieceAction {
    return action.type === 'capture-piece';
  },

  /**
   * Check if action affects the board state
   */
  affectsBoardState(action: GameAction): boolean {
    const boardAffectingTypes = [
      'place-land', 'place-citadel', 'place-piece', 'move-piece', 'capture-piece',
      'builder-place-land', 'builder-move-land', 'builder-remove-land',
      'bomber-explode', 'necromancer-resurrect', 'turtle-carry'
    ];
    return boardAffectingTypes.includes(action.type);
  }
};
