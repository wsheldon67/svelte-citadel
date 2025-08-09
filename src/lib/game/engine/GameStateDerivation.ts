import type { InitialGameState, GameState, Player, Land, Piece, Citadel } from './GameState.js';
import type { GameAction } from './GameAction.js';
import { IdUtils } from '../utils/GameUtils.js';

/**
 * Engine for deriving current game state from initial state + action history
 * This is the core of the event sourcing system
 */
export class GameStateDerivation {
  /**
   * Derive the complete current game state from initial state and actions
   */
  static deriveState(initialState: InitialGameState, actions: GameAction[]): GameState {
    // Start with base state from initial configuration
    let state: GameState = {
      id: initialState.id,
      createdAt: initialState.createdAt,
      updatedAt: Date.now(),
      phase: 'setup',
      config: initialState.config,
      players: [],
      currentPlayerId: null,
      lands: [],
      pieces: [],
      citadels: [],
      graveyard: [],
      communityPool: [],
      winnerId: null
    };

    // Apply each action in chronological order
    for (const action of actions) {
      state = GameStateDerivation.applyAction(state, action);
    }

    return state;
  }

  /**
   * Apply a single action to the current state and return new state
   */
  static applyAction(currentState: GameState, action: GameAction): GameState {
    // Always update the timestamp
    const baseState = {
      ...currentState,
      updatedAt: action.timestamp
    };

    switch (action.type) {
      case 'join-game':
        return GameStateDerivation.applyJoinGame(baseState, action);
      
      case 'start-game':
        return GameStateDerivation.applyStartGame(baseState, action);
      
      case 'place-land':
        return GameStateDerivation.applyPlaceLand(baseState, action);
      
      case 'place-citadel':
        return GameStateDerivation.applyPlaceCitadel(baseState, action);
      
      case 'select-piece':
        return GameStateDerivation.applySelectPiece(baseState, action);
      
      case 'place-piece':
        return GameStateDerivation.applyPlacePiece(baseState, action);
      
      case 'move-piece':
        return GameStateDerivation.applyMovePiece(baseState, action);
      
      case 'capture-piece':
        return GameStateDerivation.applyCapturePiece(baseState, action);
      
      case 'end-turn':
        return GameStateDerivation.applyEndTurn(baseState, action);
      
      case 'concede':
        return GameStateDerivation.applyConcedeGame(baseState, action);
      
      // Add more action handlers as needed
      default:
        console.warn(`Unknown action type: ${(action as any).type}`);
        return baseState;
    }
  }

  /**
   * Handle player joining the game
   */
  private static applyJoinGame(state: GameState, action: Extract<GameAction, { type: 'join-game' }>): GameState {
    // Check if player already exists
    if (state.players.find(p => p.id === action.playerId)) {
      return state; // Player already joined
    }

    const newPlayer: Player = {
      id: action.playerId,
      name: action.playerName,
      artSetId: action.artSetId,
      isHost: false, // Host is determined by initial state
      personalStash: [],
      turnOrder: state.players.length
    };

    return {
      ...state,
      players: [...state.players, newPlayer]
    };
  }

  /**
   * Handle starting the game (move to land placement phase)
   */
  private static applyStartGame(state: GameState, action: Extract<GameAction, { type: 'start-game' }>): GameState {
    if (state.phase !== 'setup') {
      return state; // Can only start from setup
    }

    return {
      ...state,
      phase: 'land-placement',
      currentPlayerId: state.players[0]?.id || null
    };
  }

  /**
   * Handle placing a land tile
   */
  private static applyPlaceLand(state: GameState, action: Extract<GameAction, { type: 'place-land' }>): GameState {
    // Check if position is already occupied
    if (state.lands.find(l => l.position.x === action.position.x && l.position.y === action.position.y)) {
      return state; // Position already has land
    }

    const newLand: Land = {
      id: action.landId,
      position: action.position,
      ownerId: action.playerId
    };

    return {
      ...state,
      lands: [...state.lands, newLand]
    };
  }

  /**
   * Handle placing a citadel
   */
  private static applyPlaceCitadel(state: GameState, action: Extract<GameAction, { type: 'place-citadel' }>): GameState {
    // Check if position is valid (has land)
    const landAtPosition = state.lands.find(l => 
      l.position.x === action.position.x && l.position.y === action.position.y
    );
    
    if (!landAtPosition || landAtPosition.ownerId !== action.playerId) {
      return state; // Invalid citadel placement
    }

    const newCitadel: Citadel = {
      id: action.citadelId,
      position: action.position,
      ownerId: action.playerId
    };

    return {
      ...state,
      citadels: [...state.citadels, newCitadel]
    };
  }

  /**
   * Handle selecting pieces for stash or community pool
   */
  private static applySelectPiece(state: GameState, action: Extract<GameAction, { type: 'select-piece' }>): GameState {
    const newPiece: Piece = {
      id: action.pieceId,
      type: action.pieceType,
      ownerId: action.destination === 'personal' ? action.playerId : 'community',
      position: null // In stash/pool, not on board
    };

    if (action.destination === 'personal') {
      // Add to player's personal stash
      const updatedPlayers = state.players.map(player => 
        player.id === action.playerId 
          ? { ...player, personalStash: [...player.personalStash, newPiece] }
          : player
      );

      return {
        ...state,
        players: updatedPlayers
      };
    } else {
      // Add to community pool
      return {
        ...state,
        communityPool: [...state.communityPool, newPiece]
      };
    }
  }

  /**
   * Handle placing a piece on the board
   */
  private static applyPlacePiece(state: GameState, action: Extract<GameAction, { type: 'place-piece' }>): GameState {
    // Find the piece in the appropriate source
    let piece: Piece | undefined;
    let updatedPlayers = state.players;
    let updatedCommunityPool = state.communityPool;

    if (action.source === 'personal') {
      const player = state.players.find(p => p.id === action.playerId);
      piece = player?.personalStash.find(p => p.id === action.pieceId);
      
      if (piece) {
        // Remove from personal stash
        updatedPlayers = state.players.map(p => 
          p.id === action.playerId 
            ? { ...p, personalStash: p.personalStash.filter(piece => piece.id !== action.pieceId) }
            : p
        );
      }
    } else {
      piece = state.communityPool.find(p => p.id === action.pieceId);
      
      if (piece) {
        // Remove from community pool and assign to player
        updatedCommunityPool = state.communityPool.filter(p => p.id !== action.pieceId);
        piece = { ...piece, ownerId: action.playerId };
      }
    }

    if (!piece) {
      return state; // Piece not found
    }

    // Place piece on board
    const placedPiece: Piece = {
      ...piece,
      position: action.position
    };

    return {
      ...state,
      players: updatedPlayers,
      communityPool: updatedCommunityPool,
      pieces: [...state.pieces, placedPiece]
    };
  }

  /**
   * Handle moving a piece
   */
  private static applyMovePiece(state: GameState, action: Extract<GameAction, { type: 'move-piece' }>): GameState {
    const updatedPieces = state.pieces.map(piece => 
      piece.id === action.pieceId 
        ? { ...piece, position: action.toPosition }
        : piece
    );

    return {
      ...state,
      pieces: updatedPieces
    };
  }

  /**
   * Handle capturing a piece
   */
  private static applyCapturePiece(state: GameState, action: Extract<GameAction, { type: 'capture-piece' }>): GameState {
    const capturedPiece = state.pieces.find(p => p.id === action.capturedPieceId);
    
    if (!capturedPiece) {
      return state; // Piece not found
    }

    // Remove from board and add to graveyard
    const updatedPieces = state.pieces.filter(p => p.id !== action.capturedPieceId);
    const graveyardPiece: Piece = {
      ...capturedPiece,
      position: null
    };

    return {
      ...state,
      pieces: updatedPieces,
      graveyard: [...state.graveyard, graveyardPiece]
    };
  }

  /**
   * Handle ending turn
   */
  private static applyEndTurn(state: GameState, action: Extract<GameAction, { type: 'end-turn' }>): GameState {
    // Find next player in turn order
    const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
    const nextPlayerId = state.players[nextPlayerIndex]?.id || null;

    return {
      ...state,
      currentPlayerId: nextPlayerId
    };
  }

  /**
   * Handle game concession
   */
  private static applyConcedeGame(state: GameState, action: Extract<GameAction, { type: 'concede' }>): GameState {
    // Find winner (any player other than the one who conceded)
    const winner = state.players.find(p => p.id !== action.playerId);

    return {
      ...state,
      phase: 'finished',
      winnerId: winner?.id || null,
      currentPlayerId: null
    };
  }
}

/**
 * Utility functions for working with derived state
 */
export const DerivationUtils = {
  /**
   * Check if an action would be valid given the current state
   * This can be used for validation before applying actions
   */
  validateAction(state: GameState, action: GameAction): boolean {
    // Basic validation - can be extended per action type
    switch (action.type) {
      case 'join-game':
        // Can only join during setup phase
        return state.phase === 'setup' && state.players.length < state.config.maxPlayers;
      
      case 'start-game':
        // Can only start from setup with at least 2 players
        return state.phase === 'setup' && state.players.length >= 2;
      
      case 'place-land':
        // Can only place during land-placement phase
        return state.phase === 'land-placement' && state.currentPlayerId === action.playerId;
      
      case 'end-turn':
        // Can only end turn if it's your turn
        return state.currentPlayerId === action.playerId;
      
      default:
        return true; // Allow unknown actions for now
    }
  },

  /**
   * Get the current state efficiently, with optional caching
   */
  getCurrentState(initialState: InitialGameState, actions: GameAction[], cache?: Map<number, GameState>): GameState {
    // Simple caching based on action count
    const actionCount = actions.length;
    
    if (cache?.has(actionCount)) {
      return cache.get(actionCount)!;
    }

    const state = GameStateDerivation.deriveState(initialState, actions);
    
    if (cache) {
      cache.set(actionCount, state);
    }

    return state;
  }
};
