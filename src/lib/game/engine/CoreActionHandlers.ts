import type { GameState, Player, Land, Piece, Citadel } from './GameState.js';
import type { 
  BaseGameAction,
  JoinGameAction,
  StartGameAction,
  PlaceLandAction,
  PlaceCitadelAction,
  SelectPieceAction,
  PlacePieceAction,
  MovePieceAction,
  CapturePieceAction,
  EndTurnAction,
  ConcedeAction
} from './BaseActions.js';
import { ActionRegistry, type ActionHandler } from './ActionRegistry.js';

/**
 * Core action handlers for basic game functionality
 * These are always available and handle the fundamental game flow
 */
export class CoreActionHandlers {
  /**
   * Register all core action handlers with the action registry
   */
  static registerAll(): void {
    ActionRegistry.registerAction({
      type: 'join-game',
      handler: CoreActionHandlers.handleJoinGame,
      validator: CoreActionHandlers.validateJoinGame,
      description: 'Player joins the game during setup'
    });

    ActionRegistry.registerAction({
      type: 'start-game',
      handler: CoreActionHandlers.handleStartGame,
      validator: CoreActionHandlers.validateStartGame,
      description: 'Start the game and move to land placement phase'
    });

    ActionRegistry.registerAction({
      type: 'place-land',
      handler: CoreActionHandlers.handlePlaceLand,
      validator: CoreActionHandlers.validatePlaceLand,
      description: 'Place a land tile on the board'
    });

    ActionRegistry.registerAction({
      type: 'place-citadel',
      handler: CoreActionHandlers.handlePlaceCitadel,
      validator: CoreActionHandlers.validatePlaceCitadel,
      description: 'Place a citadel on a land tile'
    });

    ActionRegistry.registerAction({
      type: 'select-piece',
      handler: CoreActionHandlers.handleSelectPiece,
      description: 'Select a piece for personal stash or community pool'
    });

    ActionRegistry.registerAction({
      type: 'place-piece',
      handler: CoreActionHandlers.handlePlacePiece,
      validator: CoreActionHandlers.validatePlacePiece,
      description: 'Place a piece on the board from stash or community pool'
    });

    ActionRegistry.registerAction({
      type: 'move-piece',
      handler: CoreActionHandlers.handleMovePiece,
      validator: CoreActionHandlers.validateMovePiece,
      description: 'Move a piece to a new position'
    });

    ActionRegistry.registerAction({
      type: 'capture-piece',
      handler: CoreActionHandlers.handleCapturePiece,
      description: 'Capture a piece and send it to the graveyard'
    });

    ActionRegistry.registerAction({
      type: 'end-turn',
      handler: CoreActionHandlers.handleEndTurn,
      validator: CoreActionHandlers.validateEndTurn,
      description: 'End the current player\'s turn'
    });

    ActionRegistry.registerAction({
      type: 'concede',
      handler: CoreActionHandlers.handleConcede,
      description: 'Concede the game'
    });
  }

  /**
   * Handle player joining the game
   */
  static handleJoinGame: ActionHandler<JoinGameAction> = (state, action) => {
    // Check if player already exists
    if (state.players.find((p: Player) => p.id === action.playerId)) {
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
  };

  static validateJoinGame = (state: GameState, action: JoinGameAction): boolean | string => {
    if (state.phase !== 'setup') {
      return 'Can only join during setup phase';
    }
    
    if (state.players.length >= state.config.maxPlayers) {
      return 'Game is full';
    }
    
    if (state.players.find(p => p.id === action.playerId)) {
      return 'Player already in game';
    }
    
    return true;
  };

  /**
   * Handle starting the game
   */
  static handleStartGame: ActionHandler<StartGameAction> = (state, action) => {
    if (state.phase !== 'setup') {
      return state; // Can only start from setup
    }

    return {
      ...state,
      phase: 'land-placement',
      currentPlayerId: state.players[0]?.id || null
    };
  };

  static validateStartGame = (state: GameState, action: StartGameAction): boolean | string => {
    if (state.phase !== 'setup') {
      return 'Can only start from setup phase';
    }
    
    if (state.players.length < 2) {
      return 'Need at least 2 players to start';
    }
    
    return true;
  };

  /**
   * Handle placing a land tile
   */
  static handlePlaceLand: ActionHandler<PlaceLandAction> = (state, action) => {
    // Check if position is already occupied
    if (state.lands.find((l: Land) => l.position.x === action.position.x && l.position.y === action.position.y)) {
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
  };

  static validatePlaceLand = (state: GameState, action: PlaceLandAction): boolean | string => {
    if (state.phase !== 'land-placement') {
      return 'Can only place land during land placement phase';
    }
    
    if (state.currentPlayerId !== action.playerId) {
      return 'Not your turn';
    }
    
    if (state.lands.find(l => l.position.x === action.position.x && l.position.y === action.position.y)) {
      return 'Position already has land';
    }
    
    return true;
  };

  /**
   * Handle placing a citadel
   */
  static handlePlaceCitadel: ActionHandler<PlaceCitadelAction> = (state, action) => {
    // Check if position is valid (has land)
    const landAtPosition = state.lands.find((l: Land) => 
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
  };

  static validatePlaceCitadel = (state: GameState, action: PlaceCitadelAction): boolean | string => {
    if (state.phase !== 'citadel-placement') {
      return 'Can only place citadel during citadel placement phase';
    }
    
    const landAtPosition = state.lands.find(l => 
      l.position.x === action.position.x && l.position.y === action.position.y
    );
    
    if (!landAtPosition) {
      return 'No land at that position';
    }
    
    if (landAtPosition.ownerId !== action.playerId) {
      return 'Can only place citadel on your own land';
    }
    
    return true;
  };

  /**
   * Handle selecting pieces for stash or community pool
   */
  static handleSelectPiece: ActionHandler<SelectPieceAction> = (state, action) => {
    const newPiece: Piece = {
      id: action.pieceId,
      type: action.pieceType as any, // Will be properly typed when pieces are implemented
      ownerId: action.destination === 'personal' ? action.playerId : 'community',
      position: null // In stash/pool, not on board
    };

    if (action.destination === 'personal') {
      // Add to player's personal stash
      const updatedPlayers = state.players.map((player: Player) => 
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
  };

  /**
   * Handle placing a piece on the board
   */
  static handlePlacePiece: ActionHandler<PlacePieceAction> = (state, action) => {
    // Find the piece in the appropriate source
    let piece: Piece | undefined;
    let updatedPlayers = state.players;
    let updatedCommunityPool = state.communityPool;

    if (action.source === 'personal') {
      const player = state.players.find((p: Player) => p.id === action.playerId);
      piece = player?.personalStash.find((p: Piece) => p.id === action.pieceId);
      
      if (piece) {
        // Remove from personal stash
        updatedPlayers = state.players.map((p: Player) => 
          p.id === action.playerId 
            ? { ...p, personalStash: p.personalStash.filter((piece: Piece) => piece.id !== action.pieceId) }
            : p
        );
      }
    } else {
      piece = state.communityPool.find((p: Piece) => p.id === action.pieceId);
      
      if (piece) {
        // Remove from community pool and assign to player
        updatedCommunityPool = state.communityPool.filter((p: Piece) => p.id !== action.pieceId);
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
  };

  static validatePlacePiece = (state: GameState, action: PlacePieceAction): boolean | string => {
    if (state.phase !== 'battle') {
      return 'Can only place pieces during battle phase';
    }
    
    if (state.currentPlayerId !== action.playerId) {
      return 'Not your turn';
    }
    
    // Check if position is already occupied
    if (state.pieces.find((p: Piece) => p.position && p.position.x === action.position.x && p.position.y === action.position.y)) {
      return 'Position already occupied';
    }
    
    return true;
  };

  /**
   * Handle moving a piece
   */
  static handleMovePiece: ActionHandler<MovePieceAction> = (state, action) => {
    const updatedPieces = state.pieces.map((piece: Piece) => 
      piece.id === action.pieceId 
        ? { ...piece, position: action.toPosition }
        : piece
    );

    return {
      ...state,
      pieces: updatedPieces
    };
  };

  static validateMovePiece = (state: GameState, action: MovePieceAction): boolean | string => {
    if (state.phase !== 'battle') {
      return 'Can only move pieces during battle phase';
    }
    
    if (state.currentPlayerId !== action.playerId) {
      return 'Not your turn';
    }
    
    const piece = state.pieces.find((p: Piece) => p.id === action.pieceId);
    if (!piece) {
      return 'Piece not found';
    }
    
    if (piece.ownerId !== action.playerId) {
      return 'Not your piece';
    }
    
    return true;
  };

  /**
   * Handle capturing a piece
   */
  static handleCapturePiece: ActionHandler<CapturePieceAction> = (state, action) => {
    const capturedPiece = state.pieces.find((p: Piece) => p.id === action.capturedPieceId);
    
    if (!capturedPiece) {
      return state; // Piece not found
    }

    // Remove from board and add to graveyard
    const updatedPieces = state.pieces.filter((p: Piece) => p.id !== action.capturedPieceId);
    const graveyardPiece: Piece = {
      ...capturedPiece,
      position: null
    };

    return {
      ...state,
      pieces: updatedPieces,
      graveyard: [...state.graveyard, graveyardPiece]
    };
  };

  /**
   * Handle ending turn
   */
  static handleEndTurn: ActionHandler<EndTurnAction> = (state, action) => {
    // Find next player in turn order
    const currentPlayerIndex = state.players.findIndex((p: Player) => p.id === state.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
    const nextPlayerId = state.players[nextPlayerIndex]?.id || null;

    return {
      ...state,
      currentPlayerId: nextPlayerId
    };
  };

  static validateEndTurn = (state: GameState, action: EndTurnAction): boolean | string => {
    if (state.currentPlayerId !== action.playerId) {
      return 'Not your turn';
    }
    
    return true;
  };

  /**
   * Handle game concession
   */
  static handleConcede: ActionHandler<ConcedeAction> = (state, action) => {
    // Find winner (any player other than the one who conceded)
    const winner = state.players.find((p: Player) => p.id !== action.playerId);

    return {
      ...state,
      phase: 'finished',
      winnerId: winner?.id || null,
      currentPlayerId: null
    };
  };
}
