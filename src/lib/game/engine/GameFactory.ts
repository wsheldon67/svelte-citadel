import type { 
  InitialGameState, 
  GameState, 
  GameConfig, 
  Player, 
  GameDocument 
} from '../engine/GameState';
import type { 
  GameAction, 
  JoinGameAction,
  StartGameAction,
  PlaceLandAction,
  PlaceCitadelAction,
  PlacePieceAction,
  MovePieceAction
} from '../engine/GameAction';
import { IdUtils } from '../utils/GameUtils';
import { GameActionUtils } from '../engine/GameAction';

/**
 * Factory functions for creating game states and actions
 */
export const GameFactory = {
  /**
   * Create a new game with initial configuration
   */
  createInitialGameState(hostPlayerId: string, config: Partial<GameConfig> = {}): InitialGameState {
    const defaultConfig: GameConfig = {
      landsPerPlayer: 3,
      personalPiecesPerPlayer: 5,
      communityPiecesPerPlayer: 3,
      maxPlayers: 2,
      gameMode: 'standard'
    };

    return {
      id: IdUtils.generateGameId(),
      createdAt: Date.now(),
      config: { ...defaultConfig, ...config },
      hostPlayerId,
      joinCode: IdUtils.generateJoinCode()
    };
  },

  /**
   * Create initial game state for battle phase
   */
  createGameState(initialState: InitialGameState, players: Player[]): GameState {
    return {
      id: initialState.id,
      createdAt: initialState.createdAt,
      updatedAt: Date.now(),
      phase: 'setup',
      config: initialState.config,
      players: players,
      currentPlayerId: null,
      lands: [],
      pieces: [],
      citadels: [],
      graveyard: [],
      communityPool: [],
      winnerId: null
    };
  },

  /**
   * Create a new game document for Firestore
   */
  createGameDocument(hostPlayerId: string, config?: Partial<GameConfig>): GameDocument {
    const initialState = GameFactory.createInitialGameState(hostPlayerId, config);
    
    return {
      initialState,
      actions: [],
      version: 1,
      lastUpdated: Date.now()
    };
  },

  /**
   * Create a new player
   */
  createPlayer(name: string, isHost: boolean = false, turnOrder: number = 0): Player {
    return {
      id: IdUtils.generatePlayerId(),
      name: name.trim(),
      isHost,
      personalStash: [],
      turnOrder,
      artSetId: undefined
    };
  }
};

/**
 * Factory functions for creating common game actions
 */
export const ActionFactory = {
  /**
   * Create a join game action
   */
  createJoinGameAction(playerId: string, playerName: string, artSetId?: string): JoinGameAction {
    return {
      ...GameActionUtils.createBase('join-game', playerId),
      type: 'join-game',
      playerName,
      artSetId
    };
  },

  /**
   * Create a start game action
   */
  createStartGameAction(playerId: string): StartGameAction {
    return {
      ...GameActionUtils.createBase('start-game', playerId),
      type: 'start-game'
    };
  },

  /**
   * Create a place land action
   */
  createPlaceLandAction(playerId: string, x: number, y: number): PlaceLandAction {
    return {
      ...GameActionUtils.createBase('place-land', playerId),
      type: 'place-land',
      position: { x, y },
      landId: IdUtils.generateLandId()
    };
  },

  /**
   * Create a place citadel action
   */
  createPlaceCitadelAction(playerId: string, x: number, y: number): PlaceCitadelAction {
    return {
      ...GameActionUtils.createBase('place-citadel', playerId),
      type: 'place-citadel',
      position: { x, y },
      citadelId: IdUtils.generateCitadelId()
    };
  },

  /**
   * Create a place piece action
   */
  createPlacePieceAction(
    playerId: string, 
    pieceId: string, 
    x: number, 
    y: number, 
    source: 'personal' | 'community' = 'personal'
  ): PlacePieceAction {
    return {
      ...GameActionUtils.createBase('place-piece', playerId),
      type: 'place-piece',
      pieceId,
      position: { x, y },
      source
    };
  },

  /**
   * Create a move piece action
   */
  createMovePieceAction(
    playerId: string,
    pieceId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    moveData?: Record<string, unknown>
  ): MovePieceAction {
    return {
      ...GameActionUtils.createBase('move-piece', playerId),
      type: 'move-piece',
      pieceId,
      fromPosition: { x: fromX, y: fromY },
      toPosition: { x: toX, y: toY },
      moveData
    };
  }
};

/**
 * Utility functions for serializing game data for Firestore
 */
export const SerializationUtils = {
  /**
   * Prepare game document for Firestore storage
   */
  serializeGameDocument(gameDoc: GameDocument): Record<string, unknown> {
    return {
      initialState: gameDoc.initialState,
      actions: gameDoc.actions,
      version: gameDoc.version,
      lastUpdated: gameDoc.lastUpdated
    };
  },

  /**
   * Deserialize game document from Firestore
   */
  deserializeGameDocument(data: Record<string, unknown>): GameDocument {
    return {
      initialState: data.initialState as InitialGameState,
      actions: data.actions as GameAction[],
      version: data.version as number,
      lastUpdated: data.lastUpdated as number
    };
  },

  /**
   * Create a lightweight game summary for listing games
   * Note: This now requires deriving state from actions, so should be used sparingly
   */
  createGameSummary(gameDoc: GameDocument, derivedState?: GameState) {
    // If no derived state provided, create minimal summary from initial state
    if (!derivedState) {
      return {
        id: gameDoc.initialState.id,
        phase: 'setup', // Default since we don't have derived state
        playerCount: 0, // Would need to count join actions
        maxPlayers: gameDoc.initialState.config.maxPlayers,
        createdAt: gameDoc.initialState.createdAt,
        updatedAt: gameDoc.lastUpdated,
        hostId: gameDoc.initialState.hostPlayerId,
        joinCode: gameDoc.initialState.joinCode,
        winnerId: null,
        actionCount: gameDoc.actions.length
      };
    }

    return {
      id: derivedState.id,
      phase: derivedState.phase,
      playerCount: derivedState.players.length,
      maxPlayers: derivedState.config.maxPlayers,
      createdAt: derivedState.createdAt,
      updatedAt: derivedState.updatedAt,
      hostId: gameDoc.initialState.hostPlayerId,
      joinCode: gameDoc.initialState.joinCode,
      winnerId: derivedState.winnerId,
      actionCount: gameDoc.actions.length
    };
  }
};
