import type { InitialGameState, GameState } from './GameState';
import type { BaseGameAction } from './BaseActions';
import { ActionRegistry } from './ActionRegistry';
import { CoreActionHandlers } from './CoreActionHandlers';

/**
 * Engine for deriving current game state from initial state + action history
 * Now uses the pluggable action registry system
 */
export class GameStateDerivation {
  private static initialized = false;

  /**
   * Initialize the derivation engine with core action handlers
   */
  static initialize(): void {
    if (GameStateDerivation.initialized) {
      return;
    }

    // Register all core action handlers
    CoreActionHandlers.registerAll();
    
    GameStateDerivation.initialized = true;
    console.log('GameStateDerivation initialized with core actions');
  }

  /**
   * Derive the complete current game state from initial state and actions
   */
  static deriveState(initialState: InitialGameState, actions: BaseGameAction[]): GameState {
    // Ensure initialization
    GameStateDerivation.initialize();

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

    // Apply each action in chronological order using registered handlers
    for (const action of actions) {
      try {
        state = GameStateDerivation.applyAction(state, action);
      } catch (error) {
        console.error(`Failed to apply action ${action.type}:`, error);
        // Continue with next action rather than breaking the entire derivation
      }
    }

    return state;
  }

  /**
   * Apply a single action to the current state using the action registry
   */
  static applyAction(currentState: GameState, action: BaseGameAction): GameState {
    // Always update the timestamp
    const baseState = {
      ...currentState,
      updatedAt: action.timestamp
    };

    // Use the action registry to apply the action
    try {
      return ActionRegistry.applyAction(baseState, action);
    } catch (error) {
      console.warn(`Unknown action type or handler error: ${action.type}`, error);
      return baseState; // Return unchanged state for unknown actions
    }
  }

  /**
   * Validate an action before applying it
   */
  static validateAction(currentState: GameState, action: BaseGameAction): boolean | string {
    GameStateDerivation.initialize();
    
    return ActionRegistry.validateAction(currentState, action);
  }

  /**
   * Check if an action type is supported
   */
  static isActionSupported(actionType: string): boolean {
    GameStateDerivation.initialize();
    
    return ActionRegistry.isRegistered(actionType);
  }

  /**
   * Get all supported action types
   */
  static getSupportedActionTypes(): string[] {
    GameStateDerivation.initialize();
    
    return ActionRegistry.getRegisteredTypes();
  }
}

/**
 * Utility functions for working with derived state
 */
export const DerivationUtils = {
  /**
   * Get the current state efficiently, with optional caching
   */
  getCurrentState(
    initialState: InitialGameState, 
    actions: BaseGameAction[], 
    cache?: Map<number, GameState>
  ): GameState {
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
  },

  /**
   * Validate that an action sequence is valid
   */
  validateActionSequence(
    initialState: InitialGameState, 
    actions: BaseGameAction[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let currentState = GameStateDerivation.deriveState(initialState, []);

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const validation = GameStateDerivation.validateAction(currentState, action);
      
      if (validation !== true) {
        errors.push(`Action ${i} (${action.type}): ${validation || 'Invalid'}`);
      } else {
        // Apply the action to continue validation with updated state
        currentState = GameStateDerivation.applyAction(currentState, action);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Simulate applying an action without modifying the actual game state
   */
  simulateAction(
    currentState: GameState, 
    action: BaseGameAction
  ): { newState: GameState; valid: boolean; error?: string } {
    try {
      const validation = GameStateDerivation.validateAction(currentState, action);
      
      if (validation !== true) {
        return {
          newState: currentState,
          valid: false,
          error: typeof validation === 'string' ? validation : 'Action is not valid'
        };
      }

      const newState = GameStateDerivation.applyAction(currentState, action);
      
      return {
        newState,
        valid: true
      };
    } catch (error) {
      return {
        newState: currentState,
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
