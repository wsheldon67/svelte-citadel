import type { Coordinate } from './Coordinate';
import { CoordinateUtils } from './Coordinate';
import type { Board } from './Board';
import type { Piece } from '../engine/GameState';

/**
 * Turtle-specific state interface for the piece.state property
 */
export interface TurtleState {
  /** ID of the piece being carried on the turtle's back (if any) */
  carriedPieceId?: string;
}

/**
 * Utilities for turtle-specific game mechanics
 */
export const TurtleUtils = {
  /**
   * Check if a piece is a turtle
   */
  isTurtle(piece: Piece): boolean {
    return piece.type === 'turtle';
  },

  /**
   * Get the turtle state from a piece
   */
  getTurtleState(turtle: Piece): TurtleState {
    if (!TurtleUtils.isTurtle(turtle)) {
      throw new Error('Piece is not a turtle');
    }
    return (turtle.state as TurtleState) || {};
  },

  /**
   * Check if a turtle is carrying a piece
   */
  isCarryingPiece(turtle: Piece): boolean {
    const state = TurtleUtils.getTurtleState(turtle);
    return !!state.carriedPieceId;
  },

  /**
   * Get the ID of the piece being carried by a turtle
   */
  getCarriedPieceId(turtle: Piece): string | null {
    const state = TurtleUtils.getTurtleState(turtle);
    return state.carriedPieceId || null;
  },

  /**
   * Create a new turtle state with a carried piece
   */
  createTurtleStateWithCarriedPiece(carriedPieceId: string): TurtleState {
    return { carriedPieceId };
  },

  /**
   * Create a new turtle state without a carried piece
   */
  createEmptyTurtleState(): TurtleState {
    return {};
  },

  /**
   * Check if a turtle can carry a specific piece
   * (turtle is not already carrying something)
   */
  canCarryPiece(turtle: Piece): boolean {
    return TurtleUtils.isTurtle(turtle) && !TurtleUtils.isCarryingPiece(turtle);
  },

  /**
   * Get all turtles on the board
   */
  getAllTurtles(board: Board): Piece[] {
    return board.getTurtlesByOwner('').concat(
      // Get turtles from all players
      Array.from(new Set(
        Array.from(board['landMap'].values())
          .map(land => land.ownerId)
          .filter(id => id !== null)
      )).flatMap(playerId => board.getTurtlesByOwner(playerId!))
    );
  },

  /**
   * Find all turtles that can be used for piece placement (adjacent to citadel)
   * Per game rules: "The Turtle functions as an adjacent tile for the Citadel to place new pieces onto"
   */
  getTurtlesAdjacentToCitadel(citadelCoord: Coordinate, board: Board): Piece[] {
    const adjacentCoords = CoordinateUtils.getOrthogonalAdjacent(citadelCoord);
    const adjacentTurtles: Piece[] = [];

    for (const coord of adjacentCoords) {
      const turtle = board.getTurtle(coord);
      if (turtle) {
        adjacentTurtles.push(turtle);
      }
    }

    return adjacentTurtles;
  },

  /**
   * Check if a turtle can have a piece placed on its back
   * (turtle exists and is not already carrying a piece)
   */
  canPlacePieceOnTurtle(coord: Coordinate, board: Board): boolean {
    const turtle = board.getTurtle(coord);
    if (!turtle) return false;
    
    return TurtleUtils.canCarryPiece(turtle);
  },

  /**
   * Get all valid coordinates where pieces can be placed adjacent to a citadel
   * This includes both land tiles and turtles per game rules
   */
  getValidPiecePlacementCoordinates(citadelCoord: Coordinate, board: Board): Coordinate[] {
    const adjacentCoords = CoordinateUtils.getOrthogonalAdjacent(citadelCoord);
    return adjacentCoords.filter(coord => {
      // Can place on land that's not occupied
      if (board.hasLand(coord) && !board.isOccupied(coord)) {
        return true;
      }
      
      // Can place on turtle that's not carrying anything
      return TurtleUtils.canPlacePieceOnTurtle(coord, board);
    });
  },

  /**
   * Check if a turtle's position provides connectivity between citadels
   * Per game rules: "The Turtle functions as a land tile for the purpose of connecting the 2 Citadels"
   */
  providesCitadelConnectivity(turtle: Piece, citadel1Coord: Coordinate, citadel2Coord: Coordinate, board: Board): boolean {
    if (!turtle.position || !TurtleUtils.isTurtle(turtle)) {
      return false;
    }

    // Turtle must be orthogonally adjacent to at least one citadel
    const adjacentToCitadel1 = CoordinateUtils.areOrthogonallyAdjacent(turtle.position, citadel1Coord);
    const adjacentToCitadel2 = CoordinateUtils.areOrthogonallyAdjacent(turtle.position, citadel2Coord);

    if (!adjacentToCitadel1 && !adjacentToCitadel2) {
      return false;
    }

    // Check if there's a foundation path between citadels that includes this turtle
    // This would require pathfinding through foundations
    return true; // Simplified for now - in full implementation, would do pathfinding
  },

  /**
   * Get all pieces that a turtle can attack
   * Per game rules: "The Turtle can attack pieces on land tiles that are orthogonally to it. It can also attack anything on its back."
   */
  getAttackableTargets(turtle: Piece, board: Board): Piece[] {
    if (!turtle.position || !TurtleUtils.isTurtle(turtle)) {
      return [];
    }

    const targets: Piece[] = [];

    // Attack pieces on orthogonally adjacent land tiles
    const adjacentCoords = CoordinateUtils.getOrthogonalAdjacent(turtle.position);
    for (const coord of adjacentCoords) {
      if (board.hasLand(coord)) {
        const piece = board.getPiece(coord);
        if (piece) {
          targets.push(piece);
        }
      }
    }

    // Attack piece on its own back (if carrying one)
    const carriedPieceId = TurtleUtils.getCarriedPieceId(turtle);
    if (carriedPieceId) {
      // In a full implementation, would need to find the piece by ID
      // For now, we know that carried pieces don't have positions in our system
      // They would be tracked differently
    }

    return targets;
  },

  /**
   * Check if a coordinate is a valid move target for a turtle
   * Turtles can move to any water coordinate (since they act as foundation)
   */
  isValidTurtleMoveTarget(coord: Coordinate, board: Board): boolean {
    return board.isWater(coord);
  },

  /**
   * Get all valid move targets for a turtle (orthogonal and diagonal)
   */
  getTurtleValidMoves(turtlePosition: Coordinate, board: Board): Coordinate[] {
    const allAdjacent = CoordinateUtils.getAllAdjacent(turtlePosition);
    return allAdjacent.filter(coord => TurtleUtils.isValidTurtleMoveTarget(coord, board));
  },

  /**
   * Simulate moving a turtle with a carried piece
   * Returns the new positions for both turtle and carried piece
   */
  simulateTurtleMove(
    turtle: Piece, 
    newPosition: Coordinate, 
    allPieces: Piece[]
  ): { turtle: Piece; carriedPiece?: Piece } {
    const carriedPieceId = TurtleUtils.getCarriedPieceId(turtle);
    
    const newTurtle: Piece = {
      ...turtle,
      position: newPosition
    };

    if (carriedPieceId) {
      const carriedPiece = allPieces.find(p => p.id === carriedPieceId);
      if (carriedPiece) {
        const newCarriedPiece: Piece = {
          ...carriedPiece,
          position: newPosition // Carried piece moves with turtle
        };
        return { turtle: newTurtle, carriedPiece: newCarriedPiece };
      }
    }

    return { turtle: newTurtle };
  }
};
