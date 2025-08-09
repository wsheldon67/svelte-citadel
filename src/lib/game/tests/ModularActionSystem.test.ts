import { describe, it, expect, beforeEach } from 'vitest';

import { ActionRegistry } from '../engine/ActionRegistry.js';
import { GameFactory } from '../engine/GameFactory.js';
import { GameStateDerivation } from '../engine/ModularGameStateDerivation.js';
import '../engine/CoreActionHandlers.js'; // Ensure core actions are registered
import type { BaseGameAction } from '../engine/BaseActions.js';
import type { GameState } from '../engine/GameState.js';

// Example custom piece action
interface TestPieceAction extends BaseGameAction {
  type: 'test-action';
  testData: string;
}

describe('Modular Action System', () => {
  beforeEach(() => {
    // Clear registry for clean tests
    ActionRegistry.clear();
  });

  it('should allow registering custom actions', () => {
    // Register a custom action
    ActionRegistry.registerAction<TestPieceAction>({
      type: 'test-action',
      handler: (state: GameState, action: TestPieceAction) => {
        return {
          ...state,
          gameSpecificState: {
            lastTestAction: action.testData
          }
        };
      },
      description: 'Test action for modular system'
    });

    expect(ActionRegistry.isRegistered('test-action')).toBe(true);
    expect(ActionRegistry.getRegisteredTypes()).toContain('test-action');
  });

  it('should apply custom actions via registry', () => {
    // Register the test action
    ActionRegistry.registerAction<TestPieceAction>({
      type: 'test-action',
      handler: (state: GameState, action: TestPieceAction) => {
        return {
          ...state,
          gameSpecificState: {
            lastTestAction: action.testData
          }
        };
      }
    });

    // Create initial game state
    const gameDoc = GameFactory.createGameDocument('player_host');
    const initialState = GameStateDerivation.deriveState(gameDoc.initialState, []);

    // Create and apply test action
    const testAction: TestPieceAction = {
      id: 'test_action_1',
      timestamp: Date.now(),
      playerId: 'player_test',
      type: 'test-action',
      testData: 'hello world'
    };

    const newState = ActionRegistry.applyAction(initialState, testAction);

    expect(newState.gameSpecificState?.lastTestAction).toBe('hello world');
  });

  it('should validate actions when validator provided', () => {
    // Register action with validator
    ActionRegistry.registerAction<TestPieceAction>({
      type: 'test-action',
      handler: (state: GameState, action: TestPieceAction) => state,
      validator: (state: GameState, action: TestPieceAction) => {
        return action.testData.length > 0 ? true : 'Test data cannot be empty';
      }
    });

    const gameDoc = GameFactory.createGameDocument('player_host');
    const initialState = GameStateDerivation.deriveState(gameDoc.initialState, []);

    // Valid action
    const validAction: TestPieceAction = {
      id: 'test_1',
      timestamp: Date.now(),
      playerId: 'player_test',
      type: 'test-action',
      testData: 'valid'
    };

    expect(ActionRegistry.validateAction(initialState, validAction)).toBe(true);

    // Invalid action
    const invalidAction: TestPieceAction = {
      id: 'test_2',
      timestamp: Date.now(),
      playerId: 'player_test',
      type: 'test-action',
      testData: ''
    };

    expect(ActionRegistry.validateAction(initialState, invalidAction)).toBe('Test data cannot be empty');
  });

  it('should work with core actions', () => {
    // Core actions should be automatically registered
    const gameDoc = GameFactory.createGameDocument('player_host');
    const actions = [
      {
        id: 'action_1',
        timestamp: Date.now(),
        playerId: 'player_alice',
        type: 'join-game',
        playerName: 'Alice'
      }
    ];

    const finalState = GameStateDerivation.deriveState(gameDoc.initialState, actions);

    expect(finalState.players).toHaveLength(1);
    expect(finalState.players[0].name).toBe('Alice');
  });

  it('should support querying actions by piece type', () => {
    // Register actions for different piece types
    ActionRegistry.registerAction({
      type: 'builder-action',
      handler: (state: GameState, action: BaseGameAction) => state,
      allowedPieceTypes: ['builder']
    });

    ActionRegistry.registerAction({
      type: 'soldier-action',
      handler: (state: GameState, action: BaseGameAction) => state,
      allowedPieceTypes: ['soldier']
    });

    ActionRegistry.registerAction({
      type: 'common-action',
      handler: (state: GameState, action: BaseGameAction) => state,
      // No allowedPieceTypes means available to all
    });

    const builderActions = ActionRegistry.getActionsForPieceType('builder');
    const soldierActions = ActionRegistry.getActionsForPieceType('soldier');

    expect(builderActions.map(a => a.type)).toContain('builder-action');
    expect(builderActions.map(a => a.type)).toContain('common-action');
    expect(builderActions.map(a => a.type)).not.toContain('soldier-action');

    expect(soldierActions.map(a => a.type)).toContain('soldier-action');
    expect(soldierActions.map(a => a.type)).toContain('common-action');
    expect(soldierActions.map(a => a.type)).not.toContain('builder-action');
  });

  it('should handle unknown actions gracefully', () => {
    const gameDoc = GameFactory.createGameDocument('player_host');
    const unknownAction: BaseGameAction = {
      id: 'unknown_1',
      timestamp: Date.now(),
      playerId: 'player_test',
      type: 'unknown-action-type'
    };

    // Should not throw, just return unchanged state
    expect(() => {
      GameStateDerivation.deriveState(gameDoc.initialState, [unknownAction]);
    }).not.toThrow();
  });
});
