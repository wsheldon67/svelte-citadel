import type { Coordinate } from './Coordinate';
import { CoordinateUtils } from './Coordinate';
import type { Piece, Land, Citadel } from '../engine/GameState';

/**
 * Foundation layer types - what provides the base for piece placement
 */
export type FoundationLayer = 'water' | 'land' | 'turtle';

/**
 * Information about what occupies a specific coordinate across all layers
 */
export interface TileInfo {
  coordinate: Coordinate;
  /** Foundation layer: land tile or turtle (mutually exclusive) */
  land: Land | null;
  turtle: Piece | null; // Piece of type 'turtle' acting as foundation
  /** Piece layer: regular pieces placed on top of foundation */
  piece: Piece | null;
  /** Citadel layer: citadels placed on foundation */
  citadel: Citadel | null;
  
  // Computed properties
  /** What type of foundation exists here */
  foundationLayer: FoundationLayer;
  /** True if this coordinate has a foundation (land or turtle) */
  hasFoundation: boolean;
  /** True if this coordinate is pure water (no foundation) */
  isWater: boolean;
  /** True if this coordinate has a land tile */
  hasLand: boolean;
  /** True if this coordinate has a turtle as foundation */
  hasTurtle: boolean;
  /** True if this coordinate has a piece on the piece layer */
  isOccupied: boolean;
  /** True if pieces can be placed here (has foundation and piece layer is empty) */
  canPlacePiece: boolean;
}

/**
 * Efficient sparse representation of the infinite game board
 * Uses Maps with coordinate keys for O(1) lookups
 * Implements layered architecture: Water -> Foundation (Land/Turtle) -> Pieces
 */
export class Board {
  private landMap = new Map<string, Land>();
  private turtleMap = new Map<string, Piece>(); // Turtles acting as foundation layer
  private pieceMap = new Map<string, Piece>(); // Regular pieces on piece layer
  private citadelMap = new Map<string, Citadel>();

  constructor(lands: Land[] = [], pieces: Piece[] = [], citadels: Citadel[] = []) {
    this.updateBoard(lands, pieces, citadels);
  }

  /**
   * Update the entire board state
   */
  updateBoard(lands: Land[], pieces: Piece[], citadels: Citadel[]): void {
    // Clear existing state
    this.landMap.clear();
    this.turtleMap.clear();
    this.pieceMap.clear();
    this.citadelMap.clear();

    // Populate land map
    lands.forEach(land => {
      const key = CoordinateUtils.toKey(land.position);
      this.landMap.set(key, land);
    });

    // Separate turtles (foundation layer) from regular pieces (piece layer)
    pieces.forEach(piece => {
      if (piece.position) {
        const key = CoordinateUtils.toKey(piece.position);
        if (piece.type === 'turtle') {
          this.turtleMap.set(key, piece);
        } else {
          this.pieceMap.set(key, piece);
        }
      }
    });

    // Populate citadel map
    citadels.forEach(citadel => {
      const key = CoordinateUtils.toKey(citadel.position);
      this.citadelMap.set(key, citadel);
    });
  }

  /**
   * Get complete information about a tile across all layers
   */
  getTileInfo(coordinate: Coordinate): TileInfo {
    const key = CoordinateUtils.toKey(coordinate);
    const land = this.landMap.get(key) || null;
    const turtle = this.turtleMap.get(key) || null;
    const piece = this.pieceMap.get(key) || null;
    const citadel = this.citadelMap.get(key) || null;

    // Determine foundation layer
    let foundationLayer: FoundationLayer = 'water';
    if (land) foundationLayer = 'land';
    else if (turtle) foundationLayer = 'turtle';

    const hasFoundation = foundationLayer !== 'water';
    const hasLand = !!land;
    const hasTurtle = !!turtle;
    const isWater = !hasFoundation;
    const isOccupied = !!piece;
    const canPlacePiece = hasFoundation && !isOccupied;

    return {
      coordinate,
      land,
      turtle,
      piece,
      citadel,
      foundationLayer,
      hasFoundation,
      isWater,
      hasLand,
      hasTurtle,
      isOccupied,
      canPlacePiece
    };
  }

  /**
   * Check if a coordinate has a foundation (land or turtle)
   */
  hasFoundation(coordinate: Coordinate): boolean {
    return this.hasLand(coordinate) || this.hasTurtle(coordinate);
  }

  /**
   * Check if a coordinate has land
   */
  hasLand(coordinate: Coordinate): boolean {
    const key = CoordinateUtils.toKey(coordinate);
    return this.landMap.has(key);
  }

  /**
   * Check if a coordinate has a turtle as foundation
   */
  hasTurtle(coordinate: Coordinate): boolean {
    const key = CoordinateUtils.toKey(coordinate);
    return this.turtleMap.has(key);
  }

  /**
   * Check if a coordinate is water (no foundation)
   */
  isWater(coordinate: Coordinate): boolean {
    return !this.hasFoundation(coordinate);
  }

  /**
   * Check if a coordinate is occupied by a piece on the piece layer
   */
  isOccupied(coordinate: Coordinate): boolean {
    const key = CoordinateUtils.toKey(coordinate);
    return this.pieceMap.has(key);
  }

  /**
   * Get the piece on the piece layer at a coordinate, if any
   */
  getPiece(coordinate: Coordinate): Piece | null {
    const key = CoordinateUtils.toKey(coordinate);
    return this.pieceMap.get(key) || null;
  }

  /**
   * Get the turtle at a coordinate, if any
   */
  getTurtle(coordinate: Coordinate): Piece | null {
    const key = CoordinateUtils.toKey(coordinate);
    return this.turtleMap.get(key) || null;
  }

  /**
   * Get the land at a coordinate, if any
   */
  getLand(coordinate: Coordinate): Land | null {
    const key = CoordinateUtils.toKey(coordinate);
    return this.landMap.get(key) || null;
  }

  /**
   * Get the citadel at a coordinate, if any
   */
  getCitadel(coordinate: Coordinate): Citadel | null {
    const key = CoordinateUtils.toKey(coordinate);
    return this.citadelMap.get(key) || null;
  }

  /**
   * Get all coordinates within a rectangular area
   */
  getCoordinatesInArea(
    topLeft: Coordinate, 
    bottomRight: Coordinate
  ): Coordinate[] {
    const coordinates: Coordinate[] = [];
    
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y <= bottomRight.y; y++) {
        coordinates.push({ x, y });
      }
    }
    
    return coordinates;
  }

  /**
   * Get all tiles within a rectangular area
   */
  getTilesInArea(
    topLeft: Coordinate, 
    bottomRight: Coordinate
  ): TileInfo[] {
    const coordinates = this.getCoordinatesInArea(topLeft, bottomRight);
    return coordinates.map(coord => this.getTileInfo(coord));
  }

  /**
   * Get all coordinates within a certain distance (Manhattan distance)
   */
  getCoordinatesWithinDistance(
    center: Coordinate, 
    maxDistance: number
  ): Coordinate[] {
    const coordinates: Coordinate[] = [];
    
    for (let x = center.x - maxDistance; x <= center.x + maxDistance; x++) {
      for (let y = center.y - maxDistance; y <= center.y + maxDistance; y++) {
        const coord = { x, y };
        if (CoordinateUtils.manhattanDistance(center, coord) <= maxDistance) {
          coordinates.push(coord);
        }
      }
    }
    
    return coordinates;
  }

  /**
   * Get all pieces within a certain distance (includes turtles from both layers)
   */
  getPiecesWithinDistance(
    center: Coordinate, 
    maxDistance: number
  ): Piece[] {
    const coordinates = this.getCoordinatesWithinDistance(center, maxDistance);
    const pieces: Piece[] = [];
    
    coordinates.forEach(coord => {
      const piece = this.getPiece(coord);
      const turtle = this.getTurtle(coord);
      if (piece) pieces.push(piece);
      if (turtle) pieces.push(turtle);
    });
    
    return pieces;
  }

  /**
   * Get all lands within a certain distance
   */
  getLandsWithinDistance(
    center: Coordinate, 
    maxDistance: number
  ): Land[] {
    const coordinates = this.getCoordinatesWithinDistance(center, maxDistance);
    return coordinates
      .map(coord => this.getLand(coord))
      .filter(land => land !== null) as Land[];
  }

  /**
   * Get all turtles within a certain distance
   */
  getTurtlesWithinDistance(
    center: Coordinate, 
    maxDistance: number
  ): Piece[] {
    const coordinates = this.getCoordinatesWithinDistance(center, maxDistance);
    return coordinates
      .map(coord => this.getTurtle(coord))
      .filter(turtle => turtle !== null) as Piece[];
  }

  /**
   * Find the closest piece to a coordinate (includes turtles from both layers)
   */
  findClosestPiece(coordinate: Coordinate): { piece: Piece; distance: number } | null {
    let closest: { piece: Piece; distance: number } | null = null;

    // Check pieces on piece layer
    for (const piece of this.pieceMap.values()) {
      if (!piece.position) continue;
      
      const distance = CoordinateUtils.manhattanDistance(coordinate, piece.position);
      
      if (!closest || distance < closest.distance) {
        closest = { piece, distance };
      }
    }

    // Check turtles on foundation layer
    for (const turtle of this.turtleMap.values()) {
      if (!turtle.position) continue;
      
      const distance = CoordinateUtils.manhattanDistance(coordinate, turtle.position);
      
      if (!closest || distance < closest.distance) {
        closest = { piece: turtle, distance };
      }
    }

    return closest;
  }

  /**
   * Get all lands owned by a specific player
   */
  getLandsByOwner(ownerId: string | null): Land[] {
    return Array.from(this.landMap.values()).filter(land => land.ownerId === ownerId);
  }

  /**
   * Get all pieces owned by a specific player (from piece layer only)
   */
  getPiecesByOwner(ownerId: string): Piece[] {
    return Array.from(this.pieceMap.values()).filter(piece => piece.ownerId === ownerId);
  }

  /**
   * Get all turtles owned by a specific player (from foundation layer)
   */
  getTurtlesByOwner(ownerId: string): Piece[] {
    return Array.from(this.turtleMap.values()).filter(turtle => turtle.ownerId === ownerId);
  }

  /**
   * Get all pieces owned by a specific player (both layers)
   */
  getAllPiecesByOwner(ownerId: string): Piece[] {
    return [
      ...this.getPiecesByOwner(ownerId),
      ...this.getTurtlesByOwner(ownerId)
    ];
  }

  /**
   * Get all citadels owned by a specific player
   */
  getCitadelsByOwner(ownerId: string): Citadel[] {
    return Array.from(this.citadelMap.values()).filter(citadel => citadel.ownerId === ownerId);
  }

  /**
   * Check if a coordinate is a valid move target for regular pieces
   * (has foundation and piece layer is not occupied)
   */
  isValidMoveTarget(coordinate: Coordinate): boolean {
    return this.hasFoundation(coordinate) && !this.isOccupied(coordinate);
  }

  /**
   * Check if a coordinate can have a piece placed on it
   * (same as valid move target)
   */
  canPlacePiece(coordinate: Coordinate): boolean {
    return this.isValidMoveTarget(coordinate);
  }

  /**
   * Check if a coordinate can have a turtle placed on it
   * (is water - no existing foundation)
   */
  canPlaceTurtle(coordinate: Coordinate): boolean {
    return this.isWater(coordinate);
  }

  /**
   * Check if a coordinate can have land placed on it
   * (is water - no existing foundation)
   */
  canPlaceLand(coordinate: Coordinate): boolean {
    return this.isWater(coordinate);
  }

  /**
   * Get all valid move targets adjacent to a coordinate
   */
  getValidAdjacentMoves(coordinate: Coordinate): Coordinate[] {
    const adjacent = CoordinateUtils.getOrthogonalAdjacent(coordinate);
    return adjacent.filter(coord => this.isValidMoveTarget(coord));
  }

  /**
   * Get all coordinates adjacent to a coordinate that have foundation (for citadel placement)
   * This includes both land and turtles per game rules
   */
  getAdjacentFoundationCoordinates(coordinate: Coordinate): Coordinate[] {
    const adjacent = CoordinateUtils.getOrthogonalAdjacent(coordinate);
    return adjacent.filter(coord => this.hasFoundation(coord));
  }

  /**
   * Get all coordinates with content (lands, turtles, pieces, or citadels)
   * Useful for determining the "active" area of the board
   */
  getAllActiveCoordinates(): Coordinate[] {
    const coordinates = new Set<string>();

    // Add all land coordinates
    for (const land of this.landMap.values()) {
      coordinates.add(CoordinateUtils.toKey(land.position));
    }

    // Add all turtle coordinates
    for (const turtle of this.turtleMap.values()) {
      if (turtle.position) {
        coordinates.add(CoordinateUtils.toKey(turtle.position));
      }
    }

    // Add all piece coordinates
    for (const piece of this.pieceMap.values()) {
      if (piece.position) {
        coordinates.add(CoordinateUtils.toKey(piece.position));
      }
    }

    // Add all citadel coordinates
    for (const citadel of this.citadelMap.values()) {
      coordinates.add(CoordinateUtils.toKey(citadel.position));
    }

    return Array.from(coordinates).map(key => CoordinateUtils.fromKey(key));
  }

  /**
   * Get the bounding box of all active content on the board
   */
  getBoundingBox(): { topLeft: Coordinate; bottomRight: Coordinate } | null {
    const activeCoords = this.getAllActiveCoordinates();
    
    if (activeCoords.length === 0) {
      return null;
    }

    let minX = activeCoords[0].x;
    let maxX = activeCoords[0].x;
    let minY = activeCoords[0].y;
    let maxY = activeCoords[0].y;

    for (const coord of activeCoords) {
      minX = Math.min(minX, coord.x);
      maxX = Math.max(maxX, coord.x);
      minY = Math.min(minY, coord.y);
      maxY = Math.max(maxY, coord.y);
    }

    return {
      topLeft: { x: minX, y: minY },
      bottomRight: { x: maxX, y: maxY }
    };
  }
}
