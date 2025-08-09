import type { BaseGameAction } from '../../engine/BaseActions';
import type { GameState } from '../../engine/GameState';
import { ActionRegistry, defineAction } from '../../engine/ActionRegistry';
import type { Coordinate } from '../../board/Coordinate';

/**
 * Example piece that demonstrates how to define custom actions
 * without touching the core action system
 */

// Define custom actions for the Builder piece
export interface BuilderPlaceLandAction extends BaseGameAction {
  type: 'builder-place-land';
  builderId: string;
  landId: string;
  position: Coordinate;
}

export interface BuilderMoveLandAction extends BaseGameAction {
  type: 'builder-move-land';
  builderId: string;
  landId: string;
  fromPosition: Coordinate;
  toPosition: Coordinate;
}

export interface BuilderRemoveLandAction extends BaseGameAction {
  type: 'builder-remove-land';
  builderId: string;
  landId: string;
  position: Coordinate;
}

/**
 * Builder piece implementation
 * This shows how piece authors can define actions without modifying core files
 */
export class BuilderPiece {
  /**
   * Register all Builder-specific actions
   * This would be called when the Builder piece is loaded
   */
  static registerActions(): void {
    // Register place land action
    defineAction<BuilderPlaceLandAction>(
      'builder-place-land',
      BuilderPiece.handlePlaceLand,
      {
        description: 'Builder places a new land tile',
        allowedPieceTypes: ['builder'],
        validator: BuilderPiece.validatePlaceLand
      }
    );

    // Register move land action
    defineAction<BuilderMoveLandAction>(
      'builder-move-land',
      BuilderPiece.handleMoveLand,
      {
        description: 'Builder moves an existing land tile',
        allowedPieceTypes: ['builder'],
        validator: BuilderPiece.validateMoveLand
      }
    );

    // Register remove land action
    defineAction<BuilderRemoveLandAction>(
      'builder-remove-land',
      BuilderPiece.handleRemoveLand,
      {
        description: 'Builder removes a land tile',
        allowedPieceTypes: ['builder'],
        validator: BuilderPiece.validateRemoveLand
      }
    );

    console.log('Builder actions registered');
  }

  /**
   * Handle placing a new land tile
   */
  private static handlePlaceLand = (state: GameState, action: BuilderPlaceLandAction): GameState => {
    // Check if builder exists and is owned by the player
    const builder = state.pieces.find(p => 
      p.id === action.builderId && p.ownerId === action.playerId
    );
    
    if (!builder || !builder.position) {
      return state; // Invalid builder or builder not on board
    }

    // Check if position is adjacent to builder
    const builderPos = builder.position;
    const targetPos = action.position;
    const isAdjacent = Math.abs(builderPos.x - targetPos.x) <= 1 && 
                      Math.abs(builderPos.y - targetPos.y) <= 1 &&
                      (builderPos.x !== targetPos.x || builderPos.y !== targetPos.y);

    if (!isAdjacent) {
      return state; // Can only place adjacent to builder
    }

    // Check if position is already occupied
    if (state.lands.find(l => l.position.x === targetPos.x && l.position.y === targetPos.y)) {
      return state; // Position already has land
    }

    // Create new land tile
    const newLand = {
      id: action.landId,
      position: action.position,
      ownerId: action.playerId
    };

    return {
      ...state,
      lands: [...state.lands, newLand]
    };
  };

  private static validatePlaceLand = (state: GameState, action: BuilderPlaceLandAction): boolean | string => {
    const builder = state.pieces.find(p => 
      p.id === action.builderId && p.ownerId === action.playerId
    );
    
    if (!builder) {
      return 'Builder not found or not owned by player';
    }
    
    if (!builder.position) {
      return 'Builder is not on the board';
    }

    // Check adjacency
    const builderPos = builder.position;
    const targetPos = action.position;
    const isAdjacent = Math.abs(builderPos.x - targetPos.x) <= 1 && 
                      Math.abs(builderPos.y - targetPos.y) <= 1 &&
                      (builderPos.x !== targetPos.x || builderPos.y !== targetPos.y);

    if (!isAdjacent) {
      return 'Can only place land adjacent to builder';
    }

    if (state.lands.find(l => l.position.x === targetPos.x && l.position.y === targetPos.y)) {
      return 'Position already has land';
    }

    return true;
  };

  /**
   * Handle moving an existing land tile
   */
  private static handleMoveLand = (state: GameState, action: BuilderMoveLandAction): GameState => {
    // Find the land to move
    const land = state.lands.find(l => l.id === action.landId);
    if (!land) {
      return state; // Land not found
    }

    // Remove from old position and add to new position
    const updatedLands = state.lands.map(l => 
      l.id === action.landId 
        ? { ...l, position: action.toPosition }
        : l
    );

    // Move any pieces that were on the land
    const updatedPieces = state.pieces.map(p => {
      if (p.position && 
          p.position.x === action.fromPosition.x && 
          p.position.y === action.fromPosition.y) {
        return { ...p, position: action.toPosition };
      }
      return p;
    });

    return {
      ...state,
      lands: updatedLands,
      pieces: updatedPieces
    };
  };

  private static validateMoveLand = (state: GameState, action: BuilderMoveLandAction): boolean | string => {
    const builder = state.pieces.find(p => 
      p.id === action.builderId && p.ownerId === action.playerId
    );
    
    if (!builder?.position) {
      return 'Builder not found or not on board';
    }

    const land = state.lands.find(l => l.id === action.landId);
    if (!land) {
      return 'Land tile not found';
    }

    // Check if builder is adjacent to the land
    const builderPos = builder.position;
    const landPos = land.position;
    const isBuilderAdjacent = Math.abs(builderPos.x - landPos.x) <= 1 && 
                             Math.abs(builderPos.y - landPos.y) <= 1;

    if (!isBuilderAdjacent) {
      return 'Builder must be adjacent to land to move it';
    }

    // Check if target position is valid
    if (state.lands.find(l => l.position.x === action.toPosition.x && l.position.y === action.toPosition.y && l.id !== action.landId)) {
      return 'Target position already has land';
    }

    return true;
  };

  /**
   * Handle removing a land tile
   */
  private static handleRemoveLand = (state: GameState, action: BuilderRemoveLandAction): GameState => {
    // Remove the land tile
    const updatedLands = state.lands.filter(l => l.id !== action.landId);

    // Send any pieces on that land to graveyard
    const piecesOnLand = state.pieces.filter(p => 
      p.position && 
      p.position.x === action.position.x && 
      p.position.y === action.position.y
    );

    const updatedPieces = state.pieces.filter(p => 
      !(p.position && 
        p.position.x === action.position.x && 
        p.position.y === action.position.y)
    );

    const graveyardPieces = piecesOnLand.map(p => ({ ...p, position: null }));

    return {
      ...state,
      lands: updatedLands,
      pieces: updatedPieces,
      graveyard: [...state.graveyard, ...graveyardPieces]
    };
  };

  private static validateRemoveLand = (state: GameState, action: BuilderRemoveLandAction): boolean | string => {
    const builder = state.pieces.find(p => 
      p.id === action.builderId && p.ownerId === action.playerId
    );
    
    if (!builder?.position) {
      return 'Builder not found or not on board';
    }

    const land = state.lands.find(l => l.id === action.landId);
    if (!land) {
      return 'Land tile not found';
    }

    // Check if builder is adjacent to the land
    const builderPos = builder.position;
    const landPos = land.position;
    const isAdjacent = Math.abs(builderPos.x - landPos.x) <= 1 && 
                      Math.abs(builderPos.y - landPos.y) <= 1;

    if (!isAdjacent) {
      return 'Builder must be adjacent to land to remove it';
    }

    // TODO: Add citadel connectivity validation
    // Don't allow removing land if it would disconnect citadels

    return true;
  };
}

/**
 * Factory functions for creating Builder actions
 * These can be used by the UI or other systems
 */
export const BuilderActionFactory = {
  createPlaceLandAction(
    playerId: string,
    builderId: string,
    landId: string,
    x: number,
    y: number
  ): BuilderPlaceLandAction {
    return {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      playerId,
      pieceId: builderId,
      type: 'builder-place-land',
      builderId,
      landId,
      position: { x, y }
    };
  },

  createMoveLandAction(
    playerId: string,
    builderId: string,
    landId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): BuilderMoveLandAction {
    return {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      playerId,
      pieceId: builderId,
      type: 'builder-move-land',
      builderId,
      landId,
      fromPosition: { x: fromX, y: fromY },
      toPosition: { x: toX, y: toY }
    };
  },

  createRemoveLandAction(
    playerId: string,
    builderId: string,
    landId: string,
    x: number,
    y: number
  ): BuilderRemoveLandAction {
    return {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      playerId,
      pieceId: builderId,
      type: 'builder-remove-land',
      builderId,
      landId,
      position: { x, y }
    };
  }
};

// Auto-register actions when the piece is imported
BuilderPiece.registerActions();
