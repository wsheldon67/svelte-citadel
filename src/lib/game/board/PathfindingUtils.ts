import type { Coordinate } from './Coordinate';
import { CoordinateUtils } from './Coordinate';
import type { Board } from './Board';

/**
 * Result of a pathfinding operation
 */
export interface PathfindingResult {
  /** Whether a path was found */
  found: boolean;
  /** The path as an array of coordinates (empty if no path found) */
  path: Coordinate[];
  /** Distance of the path (number of steps) */
  distance: number;
  /** Coordinates that were explored during pathfinding */
  explored: Coordinate[];
}

/**
 * Options for pathfinding algorithms
 */
export interface PathfindingOptions {
  /** Maximum search distance (prevents infinite loops) */
  maxDistance?: number;
  /** Whether to allow diagonal movement */
  allowDiagonal?: boolean;
  /** Custom validation function for valid moves */
  isValidMove?: (from: Coordinate, to: Coordinate, board: Board) => boolean;
  /** Whether to include the start coordinate in the path */
  includeStart?: boolean;
}

/**
 * Pathfinding utilities for the game board
 */
export const PathfindingUtils = {
  /**
   * Find a path between two coordinates using A* algorithm
   * Only traverses through foundation tiles (land or turtles) by default
   */
  findPath(
    start: Coordinate,
    goal: Coordinate,
    board: Board,
    options: PathfindingOptions = {}
  ): PathfindingResult {
    const {
      maxDistance = 100,
      allowDiagonal = false,
      isValidMove = (from: Coordinate, to: Coordinate, board: Board) => 
        board.hasFoundation(to) && !board.isOccupied(to),
      includeStart = true
    } = options;

    // Early exit if start or goal don't have foundation
    if (!board.hasFoundation(start) || !board.hasFoundation(goal)) {
      return { found: false, path: [], distance: 0, explored: [] };
    }

    // Early exit if start equals goal
    if (CoordinateUtils.equals(start, goal)) {
      return { 
        found: true, 
        path: includeStart ? [start] : [], 
        distance: 0, 
        explored: [start] 
      };
    }

    // A* implementation
    const openSet = new Set<string>();
    const closedSet = new Set<string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const cameFrom = new Map<string, string>();

    const startKey = CoordinateUtils.toKey(start);
    const goalKey = CoordinateUtils.toKey(goal);

    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, CoordinateUtils.manhattanDistance(start, goal));

    while (openSet.size > 0) {
      // Find node with lowest fScore
      let currentKey = '';
      let lowestFScore = Infinity;
      
      for (const key of openSet) {
        const score = fScore.get(key) || Infinity;
        if (score < lowestFScore) {
          lowestFScore = score;
          currentKey = key;
        }
      }

      if (currentKey === goalKey) {
        // Reconstruct path
        const path: Coordinate[] = [];
        const explored: Coordinate[] = [];
        
        // Add explored coordinates
        for (const key of closedSet) {
          explored.push(CoordinateUtils.fromKey(key));
        }

        // Reconstruct path
        let current = currentKey;
        while (current) {
          path.unshift(CoordinateUtils.fromKey(current));
          current = cameFrom.get(current) || '';
        }

        // Remove start if not requested
        if (!includeStart && path.length > 0) {
          path.shift();
        }

        return {
          found: true,
          path,
          distance: path.length,
          explored
        };
      }

      openSet.delete(currentKey);
      closedSet.add(currentKey);

      const current = CoordinateUtils.fromKey(currentKey);
      const currentGScore = gScore.get(currentKey) || 0;

      // Check if we've exceeded max distance
      if (currentGScore >= maxDistance) {
        continue;
      }

      // Get neighbors
      const neighbors = allowDiagonal 
        ? CoordinateUtils.getAllAdjacent(current)
        : CoordinateUtils.getOrthogonalAdjacent(current);

      for (const neighbor of neighbors) {
        const neighborKey = CoordinateUtils.toKey(neighbor);

        if (closedSet.has(neighborKey)) {
          continue;
        }

        if (!isValidMove(current, neighbor, board)) {
          continue;
        }

        const tentativeGScore = currentGScore + 1;

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
          continue;
        }

        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + CoordinateUtils.manhattanDistance(neighbor, goal));
      }
    }

    // No path found
    const explored: Coordinate[] = [];
    for (const key of closedSet) {
      explored.push(CoordinateUtils.fromKey(key));
    }

    return { found: false, path: [], distance: 0, explored };
  },

  /**
   * Check if two coordinates are connected via land
   */
  areConnected(
    start: Coordinate,
    goal: Coordinate,
    board: Board,
    options: PathfindingOptions = {}
  ): boolean {
    const result = PathfindingUtils.findPath(start, goal, board, options);
    return result.found;
  },

  /**
   * Find all coordinates reachable from a starting point
   * Uses flood fill algorithm
   */
  findReachableArea(
    start: Coordinate,
    board: Board,
    options: PathfindingOptions = {}
  ): Coordinate[] {
    const {
      maxDistance = 100,
      allowDiagonal = false,
      isValidMove = (from: Coordinate, to: Coordinate, board: Board) => 
        board.hasFoundation(to)
    } = options;

    const reachable: Coordinate[] = [];
    const visited = new Set<string>();
    const queue: { coord: Coordinate; distance: number }[] = [];

    const startKey = CoordinateUtils.toKey(start);
    if (!board.hasFoundation(start)) {
      return reachable;
    }

    queue.push({ coord: start, distance: 0 });
    visited.add(startKey);

    while (queue.length > 0) {
      const { coord: current, distance } = queue.shift()!;
      reachable.push(current);

      if (distance >= maxDistance) {
        continue;
      }

      const neighbors = allowDiagonal 
        ? CoordinateUtils.getAllAdjacent(current)
        : CoordinateUtils.getOrthogonalAdjacent(current);

      for (const neighbor of neighbors) {
        const neighborKey = CoordinateUtils.toKey(neighbor);

        if (visited.has(neighborKey)) {
          continue;
        }

        if (isValidMove(current, neighbor, board)) {
          visited.add(neighborKey);
          queue.push({ coord: neighbor, distance: distance + 1 });
        }
      }
    }

    return reachable;
  },

  /**
   * Find all connected foundation areas (land + turtle islands)
   * Returns groups of connected foundation coordinates
   */
  findConnectedFoundationAreas(board: Board): Coordinate[][] {
    const allFoundations: Coordinate[] = [];
    
    // Get all land positions
    Array.from(board['landMap'].values()).forEach(land => {
      allFoundations.push(land.position);
    });
    
    // Get all turtle positions
    Array.from(board['turtleMap'].values()).forEach(turtle => {
      if (turtle.position) {
        allFoundations.push(turtle.position);
      }
    });

    const visited = new Set<string>();
    const areas: Coordinate[][] = [];

    for (const foundation of allFoundations) {
      const foundationKey = CoordinateUtils.toKey(foundation);
      if (visited.has(foundationKey)) {
        continue;
      }

      // Find all foundations connected to this one
      const connectedArea = PathfindingUtils.findReachableArea(
        foundation,
        board,
        {
          isValidMove: (from, to, board) => board.hasFoundation(to)
        }
      );

      // Mark all as visited
      connectedArea.forEach(coord => {
        visited.add(CoordinateUtils.toKey(coord));
      });

      areas.push(connectedArea);
    }

    return areas;
  },

  /**
   * Check if all lands AND turtles owned by a player are connected
   * Important for citadel connectivity rules
   */
  arePlayerFoundationsConnected(playerId: string, board: Board): boolean {
    const playerLands = board.getLandsByOwner(playerId);
    const playerTurtles = board.getTurtlesByOwner(playerId);
    const allFoundations = [...playerLands.map(l => l.position), ...playerTurtles.map(t => t.position!).filter(p => p)];
    
    if (allFoundations.length <= 1) {
      return true; // Single foundation or no foundations are trivially connected
    }

    // Check if we can reach all foundations from the first one
    const reachable = PathfindingUtils.findReachableArea(
      allFoundations[0],
      board,
      {
        isValidMove: (from, to, board) => {
          const land = board.getLand(to);
          const turtle = board.getTurtle(to);
          return (land?.ownerId === playerId) || (turtle?.ownerId === playerId);
        }
      }
    );

    return reachable.length === allFoundations.length;
  },

  /**
   * Check if a citadel is properly connected to its owner's foundations
   */
  isCitadelConnected(citadelCoord: Coordinate, playerId: string, board: Board): boolean {
    const playerLands = board.getLandsByOwner(playerId);
    const playerTurtles = board.getTurtlesByOwner(playerId);
    
    if (playerLands.length === 0 && playerTurtles.length === 0) {
      return false; // No foundations to connect to
    }

    // Citadel must be adjacent to at least one owned foundation (land or turtle)
    const adjacent = CoordinateUtils.getOrthogonalAdjacent(citadelCoord);
    const hasAdjacentFoundation = adjacent.some(coord => {
      const land = board.getLand(coord);
      const turtle = board.getTurtle(coord);
      return (land?.ownerId === playerId) || (turtle?.ownerId === playerId);
    });

    if (!hasAdjacentFoundation) {
      return false;
    }

    // All player foundations must be connected (citadel doesn't break connectivity)
    return PathfindingUtils.arePlayerFoundationsConnected(playerId, board);
  },

  /**
   * Get the shortest distance between two coordinates through valid moves
   */
  getShortestDistance(
    start: Coordinate,
    goal: Coordinate,
    board: Board,
    options: PathfindingOptions = {}
  ): number {
    const result = PathfindingUtils.findPath(start, goal, board, options);
    return result.found ? result.distance : -1;
  },

  /**
   * Find all coordinates within movement range of a piece
   */
  getMovementRange(
    start: Coordinate,
    maxMoves: number,
    board: Board,
    options: PathfindingOptions = {}
  ): Coordinate[] {
    return PathfindingUtils.findReachableArea(start, board, {
      ...options,
      maxDistance: maxMoves
    });
  }
};
