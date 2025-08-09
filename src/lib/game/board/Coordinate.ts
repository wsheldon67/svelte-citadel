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
  },

  /**
   * Calculate Euclidean distance between two coordinates
   */
  euclideanDistance(a: Coordinate, b: Coordinate): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Calculate Chebyshev distance (maximum of horizontal and vertical distance)
   */
  chebyshevDistance(a: Coordinate, b: Coordinate): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return Math.max(dx, dy);
  },

  /**
   * Get coordinates in a straight line between two points
   * Uses Bresenham's line algorithm
   */
  getLineBetween(start: Coordinate, end: Coordinate): Coordinate[] {
    const line: Coordinate[] = [];
    
    let x0 = start.x;
    let y0 = start.y;
    const x1 = end.x;
    const y1 = end.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      line.push({ x: x0, y: y0 });

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return line;
  },

  /**
   * Check if a coordinate is in a straight line from another coordinate
   * (orthogonal or diagonal)
   */
  isInStraightLine(from: Coordinate, to: Coordinate): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Same position
    if (dx === 0 && dy === 0) return true;

    // Orthogonal lines
    if (dx === 0 || dy === 0) return true;

    // Diagonal lines
    if (Math.abs(dx) === Math.abs(dy)) return true;

    return false;
  },

  /**
   * Get all coordinates in a diamond/rhombus pattern around center
   * with given radius (Manhattan distance)
   */
  getDiamondPattern(center: Coordinate, radius: number): Coordinate[] {
    const coordinates: Coordinate[] = [];
    
    for (let x = center.x - radius; x <= center.x + radius; x++) {
      for (let y = center.y - radius; y <= center.y + radius; y++) {
        const coord = { x, y };
        if (CoordinateUtils.manhattanDistance(center, coord) === radius) {
          coordinates.push(coord);
        }
      }
    }
    
    return coordinates;
  },

  /**
   * Get all coordinates in a square pattern around center
   */
  getSquarePattern(center: Coordinate, radius: number): Coordinate[] {
    const coordinates: Coordinate[] = [];
    
    for (let x = center.x - radius; x <= center.x + radius; x++) {
      for (let y = center.y - radius; y <= center.y + radius; y++) {
        if (Math.abs(x - center.x) === radius || Math.abs(y - center.y) === radius) {
          coordinates.push({ x, y });
        }
      }
    }
    
    return coordinates;
  },

  /**
   * Get coordinates in the four cardinal directions at specified distance
   */
  getCardinalDirections(center: Coordinate, distance: number): Coordinate[] {
    return [
      { x: center.x, y: center.y - distance }, // north
      { x: center.x + distance, y: center.y }, // east
      { x: center.x, y: center.y + distance }, // south
      { x: center.x - distance, y: center.y }, // west
    ];
  },

  /**
   * Get coordinates in the four diagonal directions at specified distance
   */
  getDiagonalDirections(center: Coordinate, distance: number): Coordinate[] {
    return [
      { x: center.x - distance, y: center.y - distance }, // northwest
      { x: center.x + distance, y: center.y - distance }, // northeast
      { x: center.x - distance, y: center.y + distance }, // southwest
      { x: center.x + distance, y: center.y + distance }, // southeast
    ];
  },

  /**
   * Rotate a coordinate around another coordinate by 90 degrees clockwise
   */
  rotateClockwise(coord: Coordinate, center: Coordinate): Coordinate {
    const dx = coord.x - center.x;
    const dy = coord.y - center.y;
    return {
      x: center.x - dy,
      y: center.y + dx
    };
  },

  /**
   * Rotate a coordinate around another coordinate by 90 degrees counter-clockwise
   */
  rotateCounterClockwise(coord: Coordinate, center: Coordinate): Coordinate {
    const dx = coord.x - center.x;
    const dy = coord.y - center.y;
    return {
      x: center.x + dy,
      y: center.y - dx
    };
  }
};
