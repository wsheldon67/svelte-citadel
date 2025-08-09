/**
 * Core coordinate system for the infinite 2D game board
 */
export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Utility functions for coordinate operations
 */
export const CoordinateUtils = {
  /**
   * Create a coordinate from x,y values
   */
  create(x: number, y: number): Coordinate {
    return { x, y };
  },

  /**
   * Convert coordinate to string key for use in Maps/Sets
   */
  toKey(coord: Coordinate): string {
    return `${coord.x},${coord.y}`;
  },

  /**
   * Parse coordinate from string key
   */
  fromKey(key: string): Coordinate {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  },

  /**
   * Check if two coordinates are equal
   */
  equals(a: Coordinate, b: Coordinate): boolean {
    return a.x === b.x && a.y === b.y;
  },

  /**
   * Get orthogonally adjacent coordinates (up, down, left, right)
   */
  getOrthogonalAdjacent(coord: Coordinate): Coordinate[] {
    return [
      { x: coord.x, y: coord.y - 1 }, // up
      { x: coord.x, y: coord.y + 1 }, // down
      { x: coord.x - 1, y: coord.y }, // left
      { x: coord.x + 1, y: coord.y }, // right
    ];
  },

  /**
   * Get diagonally adjacent coordinates
   */
  getDiagonalAdjacent(coord: Coordinate): Coordinate[] {
    return [
      { x: coord.x - 1, y: coord.y - 1 }, // top-left
      { x: coord.x + 1, y: coord.y - 1 }, // top-right
      { x: coord.x - 1, y: coord.y + 1 }, // bottom-left
      { x: coord.x + 1, y: coord.y + 1 }, // bottom-right
    ];
  },

  /**
   * Get all adjacent coordinates (orthogonal + diagonal)
   */
  getAllAdjacent(coord: Coordinate): Coordinate[] {
    return [
      ...CoordinateUtils.getOrthogonalAdjacent(coord),
      ...CoordinateUtils.getDiagonalAdjacent(coord),
    ];
  },

  /**
   * Calculate Manhattan distance between two coordinates
   */
  manhattanDistance(a: Coordinate, b: Coordinate): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  },

  /**
   * Check if two coordinates are orthogonally adjacent
   */
  areOrthogonallyAdjacent(a: Coordinate, b: Coordinate): boolean {
    const distance = CoordinateUtils.manhattanDistance(a, b);
    return distance === 1;
  },

  /**
   * Check if two coordinates are diagonally adjacent
   */
  areDiagonallyAdjacent(a: Coordinate, b: Coordinate): boolean {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx === 1 && dy === 1;
  },

  /**
   * Check if two coordinates are adjacent (orthogonal or diagonal)
   */
  areAdjacent(a: Coordinate, b: Coordinate): boolean {
    return CoordinateUtils.areOrthogonallyAdjacent(a, b) || CoordinateUtils.areDiagonallyAdjacent(a, b);
  }
};
