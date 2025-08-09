import type { Coordinate } from '../board/Coordinate';
import type { GameAction } from './GameAction';

/**
 * Represents a piece type in the game
 */
export type PieceType = 
  | 'soldier' 
  | 'bird' 
  | 'rabbit' 
  | 'turtle' 
  | 'builder' 
  | 'bomber' 
  | 'necromancer' 
  | 'assassin';

/**
 * Represents a piece in the game with minimal state for Firestore storage
 */
export interface Piece {
  /** Unique identifier for this piece instance */
  id: string;
  /** Type of piece (determines behavior) */
  type: PieceType;
  /** ID of the player who owns this piece */
  ownerId: string;
  /** Current position on the board (null if in graveyard/stash) */
  position: Coordinate | null;
  /** Piece-specific state data */
  state?: Record<string, unknown>;
}

/**
 * Represents a land tile on the board
 */
export interface Land {
  /** Unique identifier for this land tile */
  id: string;
  /** Position of the land tile */
  position: Coordinate;
  /** ID of the player who owns this land (null for neutral) */
  ownerId: string | null;
}

/**
 * Represents a citadel in the game
 */
export interface Citadel {
  /** Unique identifier for this citadel */
  id: string;
  /** Position of the citadel */
  position: Coordinate;
  /** ID of the player who owns this citadel */
  ownerId: string;
}

/**
 * Represents a player in the game
 */
export interface Player {
  /** Unique identifier for the player */
  id: string;
  /** Display name for the player */
  name: string;
  /** Selected art set ID */
  artSetId?: string;
  /** Whether this player is the host */
  isHost: boolean;
  /** Player's personal piece stash */
  personalStash: Piece[];
  /** Order in which this player takes turns */
  turnOrder: number;
}

/**
 * Different phases of the game
 */
export type GamePhase = 
  | 'setup'        // Players joining, configuring
  | 'land-placement' // Players placing their initial lands
  | 'citadel-placement' // Players placing their citadels
  | 'piece-selection' // Players choosing pieces for personal stash and community pool
  | 'battle'       // Main game phase
  | 'finished';    // Game has ended

/**
 * Game configuration settings
 */
export interface GameConfig {
  /** Number of land tiles each player starts with */
  landsPerPlayer: number;
  /** Number of pieces each player gets in their personal stash */
  personalPiecesPerPlayer: number;
  /** Number of pieces in the shared community pool */
  communityPiecesPerPlayer: number;
  /** Maximum number of players allowed */
  maxPlayers: number;
  /** Game mode variant */
  gameMode: 'standard' | 'capture-flag' | 'conquest' | 'defender';
}

/**
 * Derived game state computed from initial state + actions
 * This is NOT stored in Firestore, but computed on-demand
 */
export interface GameState {
  /** Unique game identifier */
  id: string;
  
  /** Game creation timestamp */
  createdAt: number;
  
  /** Last update timestamp */
  updatedAt: number;
  
  /** Current game phase */
  phase: GamePhase;
  
  /** Game configuration */
  config: GameConfig;
  
  /** All players in the game */
  players: Player[];
  
  /** ID of the current player whose turn it is */
  currentPlayerId: string | null;
  
  /** All land tiles on the board */
  lands: Land[];
  
  /** All pieces currently on the board */
  pieces: Piece[];
  
  /** All citadels in the game */
  citadels: Citadel[];
  
  /** Pieces that have been captured/destroyed */
  graveyard: Piece[];
  
  /** Shared community pool of pieces */
  communityPool: Piece[];
  
  /** Winner of the game (if finished) */
  winnerId: string | null;
  
  /** Additional game-specific state */
  gameSpecificState?: Record<string, unknown>;
}

/**
 * Initial game state before any actions
 */
export interface InitialGameState {
  /** Basic game info */
  id: string;
  createdAt: number;
  config: GameConfig;
  
  /** Host player who created the game */
  hostPlayerId: string;
  
  /** Join code for other players */
  joinCode: string;
}

/**
 * The complete game document stored in Firestore
 * Pure event sourcing - only stores initial state and action history
 */
export interface GameDocument {
  /** Initial game state */
  initialState: InitialGameState;
  
  /** Chronological list of all actions taken */
  actions: GameAction[];
  
  /** Version for optimistic concurrency control */
  version: number;
  
  /** Last update timestamp for efficient queries */
  lastUpdated: number;
}
