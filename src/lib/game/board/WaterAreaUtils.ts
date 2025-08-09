import type { Coordinate } from './Coordinate';
import { CoordinateUtils } from './Coordinate';
import { Board } from './Board';

/**
 * Information about a water area
 */
export interface WaterArea {
  /** All coordinates that make up this water area */
  coordinates: Coordinate[];
  /** Perimeter coordinates (land tiles adjacent to this water) */
  perimeter: Coordinate[];
  /** Size of the water area */
  size: number;
  /** Whether this is an "enclosed" water area (completely surrounded by land) */
  isEnclosed: boolean;
}

/**
 * Utilities for calculating water areas and related board properties
 */
export const WaterAreaUtils = {
  /**
   * Find all connected water areas on the board
   * Returns groups of connected water coordinates
   */
  findWaterAreas(board: Board, boundingBox?: { topLeft: Coordinate; bottomRight: Coordinate }): WaterArea[] {
    // If no bounding box provided, use the board's bounding box plus some padding for water detection
    let searchArea = boundingBox;
    if (!searchArea) {
      const boardBounds = board.getBoundingBox();
      if (!boardBounds) {
        // Empty board - create a small search area around origin
        searchArea = {
          topLeft: { x: -5, y: -5 },
          bottomRight: { x: 5, y: 5 }
        };
      } else {
        // Add padding around the board's content
        const padding = 3;
        searchArea = {
          topLeft: { 
            x: boardBounds.topLeft.x - padding, 
            y: boardBounds.topLeft.y - padding 
          },
          bottomRight: { 
            x: boardBounds.bottomRight.x + padding, 
            y: boardBounds.bottomRight.y + padding 
          }
        };
      }
    }

    const allCoords = board.getCoordinatesInArea(searchArea.topLeft, searchArea.bottomRight);
    const waterCoords = allCoords.filter(coord => board.isWater(coord));
    const visited = new Set<string>();
    const waterAreas: WaterArea[] = [];

    for (const coord of waterCoords) {
      const coordKey = CoordinateUtils.toKey(coord);
      if (visited.has(coordKey)) {
        continue;
      }

      // Find all water connected to this coordinate
      const areaCoords = WaterAreaUtils.findConnectedWater(coord, board, searchArea);
      
      // Mark all as visited
      areaCoords.forEach(c => visited.add(CoordinateUtils.toKey(c)));

      // Calculate perimeter and other properties
      const perimeter = WaterAreaUtils.getWaterPerimeter(areaCoords, board);
      const isEnclosed = WaterAreaUtils.isWaterAreaEnclosed(areaCoords, board, searchArea);

      waterAreas.push({
        coordinates: areaCoords,
        perimeter,
        size: areaCoords.length,
        isEnclosed
      });
    }

    return waterAreas;
  },

  /**
   * Find all water coordinates connected to a starting water coordinate
   */
  findConnectedWater(
    start: Coordinate, 
    board: Board, 
    boundingBox: { topLeft: Coordinate; bottomRight: Coordinate }
  ): Coordinate[] {
    if (!board.isWater(start)) {
      return [];
    }

    const connected: Coordinate[] = [];
    const visited = new Set<string>();
    const queue: Coordinate[] = [start];

    visited.add(CoordinateUtils.toKey(start));

    while (queue.length > 0) {
      const current = queue.shift()!;
      connected.push(current);

      const neighbors = CoordinateUtils.getOrthogonalAdjacent(current);

      for (const neighbor of neighbors) {
        const neighborKey = CoordinateUtils.toKey(neighbor);

        if (visited.has(neighborKey)) {
          continue;
        }

        // Check if neighbor is within bounds
        if (neighbor.x < boundingBox.topLeft.x || neighbor.x > boundingBox.bottomRight.x ||
            neighbor.y < boundingBox.topLeft.y || neighbor.y > boundingBox.bottomRight.y) {
          continue;
        }

        if (board.isWater(neighbor)) {
          visited.add(neighborKey);
          queue.push(neighbor);
        }
      }
    }

    return connected;
  },

  /**
   * Get all land coordinates that border a water area
   */
  getWaterPerimeter(waterCoords: Coordinate[], board: Board): Coordinate[] {
    const perimeter = new Set<string>();

    for (const waterCoord of waterCoords) {
      const neighbors = CoordinateUtils.getOrthogonalAdjacent(waterCoord);
      
      for (const neighbor of neighbors) {
        if (board.hasLand(neighbor)) {
          perimeter.add(CoordinateUtils.toKey(neighbor));
        }
      }
    }

    return Array.from(perimeter).map(key => CoordinateUtils.fromKey(key));
  },

  /**
   * Check if a water area is completely enclosed by land
   * (doesn't touch the boundary of the search area)
   */
  isWaterAreaEnclosed(
    waterCoords: Coordinate[], 
    board: Board, 
    boundingBox: { topLeft: Coordinate; bottomRight: Coordinate }
  ): boolean {
    for (const coord of waterCoords) {
      // If any water coordinate is at the boundary, the area is not enclosed
      if (coord.x === boundingBox.topLeft.x || coord.x === boundingBox.bottomRight.x ||
          coord.y === boundingBox.topLeft.y || coord.y === boundingBox.bottomRight.y) {
        return false;
      }
    }
    return true;
  },

  /**
   * Calculate the total water area within a bounding box
   */
  calculateWaterArea(
    boundingBox: { topLeft: Coordinate; bottomRight: Coordinate }, 
    board: Board
  ): number {
    const allCoords = board.getCoordinatesInArea(boundingBox.topLeft, boundingBox.bottomRight);
    return allCoords.filter(coord => board.isWater(coord)).length;
  },

  /**
   * Calculate the total land area within a bounding box
   */
  calculateLandArea(
    boundingBox: { topLeft: Coordinate; bottomRight: Coordinate }, 
    board: Board
  ): number {
    const allCoords = board.getCoordinatesInArea(boundingBox.topLeft, boundingBox.bottomRight);
    return allCoords.filter(coord => board.hasLand(coord)).length;
  },

  /**
   * Get all water coordinates adjacent to a specific land coordinate
   */
  getAdjacentWater(landCoord: Coordinate, board: Board): Coordinate[] {
    const adjacent = CoordinateUtils.getOrthogonalAdjacent(landCoord);
    return adjacent.filter(coord => board.isWater(coord));
  },

  /**
   * Check if placing land at a coordinate would split a water area
   */
  wouldSplitWaterArea(coord: Coordinate, board: Board): boolean {
    if (!board.isWater(coord)) {
      return false; // Can't split if not water
    }

    // Get adjacent water coordinates
    const adjacentWater = WaterAreaUtils.getAdjacentWater(coord, board);
    
    if (adjacentWater.length <= 1) {
      return false; // Can't split with 0 or 1 adjacent water
    }

    // Check if all adjacent water coordinates are connected without going through this coordinate
    // Create a temporary board state with land at this coordinate
    const currentLands = Array.from(board['landMap'].values());
    const currentPieces = Array.from(board['pieceMap'].values());
    const currentTurtles = Array.from(board['turtleMap'].values());
    const currentCitadels = Array.from(board['citadelMap'].values());
    
    const testBoard = new Board(
      [...currentLands, { id: 'temp', position: coord, ownerId: null }],
      [...currentPieces, ...currentTurtles],
      currentCitadels
    );

    // Check if first adjacent water can reach all others
    const reachable = WaterAreaUtils.findConnectedWater(
      adjacentWater[0], 
      testBoard,
      {
        topLeft: { x: coord.x - 10, y: coord.y - 10 },
        bottomRight: { x: coord.x + 10, y: coord.y + 10 }
      }
    );

    // If not all adjacent water is reachable, then placing land here would split the water
    return adjacentWater.some(waterCoord => 
      !reachable.some(reachableCoord => CoordinateUtils.equals(waterCoord, reachableCoord))
    );
  },

  /**
   * Check if removing land at a coordinate would merge water areas
   */
  wouldMergeWaterAreas(coord: Coordinate, board: Board): boolean {
    if (!board.hasLand(coord)) {
      return false; // Can't merge if not land
    }

    // Get adjacent water coordinates
    const adjacentWater = WaterAreaUtils.getAdjacentWater(coord, board);
    
    if (adjacentWater.length <= 1) {
      return false; // Can't merge with 0 or 1 adjacent water
    }

    // Check if adjacent water coordinates belong to different water areas
    const waterAreas = WaterAreaUtils.findWaterAreas(board);
    const adjacentAreas = new Set<number>();

    for (const waterCoord of adjacentWater) {
      for (let i = 0; i < waterAreas.length; i++) {
        if (waterAreas[i].coordinates.some(c => CoordinateUtils.equals(c, waterCoord))) {
          adjacentAreas.add(i);
          break;
        }
      }
    }

    // If adjacent water belongs to different areas, removing this land would merge them
    return adjacentAreas.size > 1;
  },

  /**
   * Find the largest water area on the board
   */
  findLargestWaterArea(board: Board): WaterArea | null {
    const waterAreas = WaterAreaUtils.findWaterAreas(board);
    
    if (waterAreas.length === 0) {
      return null;
    }

    return waterAreas.reduce((largest, current) => 
      current.size > largest.size ? current : largest
    );
  },

  /**
   * Find all enclosed water areas (lakes/ponds)
   */
  findEnclosedWaterAreas(board: Board): WaterArea[] {
    const waterAreas = WaterAreaUtils.findWaterAreas(board);
    return waterAreas.filter(area => area.isEnclosed);
  },

  /**
   * Calculate water coverage ratio within a bounding box
   */
  calculateWaterCoverageRatio(
    boundingBox: { topLeft: Coordinate; bottomRight: Coordinate }, 
    board: Board
  ): number {
    const totalArea = (boundingBox.bottomRight.x - boundingBox.topLeft.x + 1) * 
                     (boundingBox.bottomRight.y - boundingBox.topLeft.y + 1);
    const waterArea = WaterAreaUtils.calculateWaterArea(boundingBox, board);
    
    return totalArea > 0 ? waterArea / totalArea : 0;
  }
};
