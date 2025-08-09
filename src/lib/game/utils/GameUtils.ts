/**
 * Utility functions for generating unique identifiers
 */
export const IdUtils = {
  /**
   * Generate a unique game ID
   */
  generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a unique player ID
   */
  generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a unique piece ID
   */
  generatePieceId(): string {
    return `piece_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a unique land ID
   */
  generateLandId(): string {
    return `land_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a unique citadel ID
   */
  generateCitadelId(): string {
    return `citadel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a 6-character join code for games
   */
  generateJoinCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

/**
 * Validation utilities for game data
 */
export const ValidationUtils = {
  /**
   * Validate that a string is a valid coordinate key
   */
  isValidCoordinateKey(key: string): boolean {
    const parts = key.split(',');
    if (parts.length !== 2) return false;
    
    const [x, y] = parts.map(Number);
    return !isNaN(x) && !isNaN(y) && Number.isInteger(x) && Number.isInteger(y);
  },

  /**
   * Validate player name
   */
  isValidPlayerName(name: string): boolean {
    return typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 50;
  },

  /**
   * Validate join code format
   */
  isValidJoinCode(code: string): boolean {
    return typeof code === 'string' && /^[A-Z0-9]{6}$/.test(code);
  },

  /**
   * Validate game ID format
   */
  isValidGameId(id: string): boolean {
    return typeof id === 'string' && id.startsWith('game_') && id.length > 10;
  },

  /**
   * Validate player ID format
   */
  isValidPlayerId(id: string): boolean {
    return typeof id === 'string' && id.startsWith('player_') && id.length > 10;
  }
};

/**
 * Helper functions for working with game state
 */
export const GameStateUtils = {
  /**
   * Find a player by ID
   */
  findPlayerById(gameState: { players: Array<{ id: string }> }, playerId: string) {
    return gameState.players.find(player => player.id === playerId);
  },

  /**
   * Find a piece by ID
   */
  findPieceById(gameState: { pieces: Array<{ id: string }> }, pieceId: string) {
    return gameState.pieces.find(piece => piece.id === pieceId);
  },

  /**
   * Find a land by position
   */
  findLandAtPosition(gameState: { lands: Array<{ position: { x: number; y: number } }> }, x: number, y: number) {
    return gameState.lands.find(land => land.position.x === x && land.position.y === y);
  },

  /**
   * Find a piece at position
   */
  findPieceAtPosition(gameState: { pieces: Array<{ position: { x: number; y: number } | null }> }, x: number, y: number) {
    return gameState.pieces.find(piece => 
      piece.position && piece.position.x === x && piece.position.y === y
    );
  },

  /**
   * Check if a position has a land tile
   */
  hasLandAtPosition(gameState: { lands: Array<{ position: { x: number; y: number } }> }, x: number, y: number): boolean {
    return GameStateUtils.findLandAtPosition(gameState, x, y) !== undefined;
  },

  /**
   * Check if a position is occupied by a piece
   */
  isPositionOccupied(gameState: { pieces: Array<{ position: { x: number; y: number } | null }> }, x: number, y: number): boolean {
    return GameStateUtils.findPieceAtPosition(gameState, x, y) !== undefined;
  },

  /**
   * Get all pieces owned by a player
   */
  getPlayerPieces(gameState: { pieces: Array<{ ownerId: string }> }, playerId: string) {
    return gameState.pieces.filter(piece => piece.ownerId === playerId);
  },

  /**
   * Get all lands owned by a player
   */
  getPlayerLands(gameState: { lands: Array<{ ownerId: string | null }> }, playerId: string) {
    return gameState.lands.filter(land => land.ownerId === playerId);
  },

  /**
   * Get the current player in turn order
   */
  getCurrentPlayer(gameState: { players: Array<{ id: string }>, currentPlayerId: string | null }) {
    if (!gameState.currentPlayerId) return null;
    return GameStateUtils.findPlayerById(gameState, gameState.currentPlayerId);
  }
};
