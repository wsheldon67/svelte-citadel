import type { GameDocument, GameState } from '../engine/GameState';
import { GameFactory, ActionFactory, SerializationUtils } from '../engine/GameFactory';
import { GameStateDerivation } from '../engine/GameStateDerivation';

/**
 * Example usage of the game data structures
 * This demonstrates how the Firestore sync would work in practice
 */

// Example 1: Creating a new game
export function createNewGameExample() {
  const hostPlayerId = 'player_alice_123';
  
  // Create initial game document
  const gameDoc: GameDocument = GameFactory.createGameDocument(hostPlayerId, {
    maxPlayers: 4,
    gameMode: 'standard',
    landsPerPlayer: 4
  });
  
  // Derive current state to see the game info
  const currentState = GameStateDerivation.deriveState(gameDoc.initialState, gameDoc.actions);
  
  console.log('New game created:', {
    gameId: currentState.id,
    joinCode: gameDoc.initialState.joinCode,
    config: currentState.config
  });
  
  return gameDoc;
}

// Example 2: Player joining game
export function playerJoinExample(gameDoc: GameDocument, playerName: string) {
  // Create join action
  const joinAction = ActionFactory.createJoinGameAction(
    'player_bob_456',
    playerName
  );
  
  // Add action to history (in real app, this would trigger state derivation)
  gameDoc.actions.push(joinAction);
  gameDoc.version++;
  
  console.log('Player joined:', {
    actionId: joinAction.id,
    playerName: joinAction.playerName,
    totalActions: gameDoc.actions.length
  });
  
  return gameDoc;
}

// Example 3: Starting land placement phase
export function startLandPlacementExample(gameDoc: GameDocument) {
  const hostId = gameDoc.initialState.hostPlayerId;
  
  // Host starts the game
  const startAction = ActionFactory.createStartGameAction(hostId);
  
  // Players place their lands
  const aliceLandAction = ActionFactory.createPlaceLandAction(hostId, 0, 0);
  const bobLandAction = ActionFactory.createPlaceLandAction('player_bob_456', 2, 0);
  
  // Add actions to history
  gameDoc.actions.push(startAction, aliceLandAction, bobLandAction);
  gameDoc.version += 3;
  
  console.log('Land placement started:', {
    totalActions: gameDoc.actions.length,
    landPositions: [
      aliceLandAction.position,
      bobLandAction.position
    ]
  });
  
  return gameDoc;
}

// Example 4: Serialization for Firestore
export function serializationExample(gameDoc: GameDocument) {
  // Convert to plain object for Firestore storage
  const serialized = SerializationUtils.serializeGameDocument(gameDoc);
  
  console.log('Serialized for Firestore:', {
    hasInitialState: !!serialized.initialState,
    actionCount: (serialized.actions as unknown[]).length,
    version: serialized.version,
    lastUpdated: serialized.lastUpdated
  });
  
  // Convert back from Firestore data
  const deserialized = SerializationUtils.deserializeGameDocument(serialized);
  
  // Derive current state to verify everything works
  const currentState = GameStateDerivation.deriveState(deserialized.initialState, deserialized.actions);
  
  console.log('Deserialized from Firestore:', {
    gameId: currentState.id,
    actionCount: deserialized.actions.length,
    version: deserialized.version
  });
  
  return { serialized, deserialized };
}

// Example 5: Game summary for lobby listings
export function gameSummaryExample(gameDoc: GameDocument) {
  // Derive current state for summary
  const currentState = GameStateDerivation.deriveState(gameDoc.initialState, gameDoc.actions);
  const summary = SerializationUtils.createGameSummary(gameDoc, currentState);
  
  console.log('Game summary for lobby:', summary);
  
  return summary;
}

// Demo function that runs through a complete example
export function runCompleteExample() {
  console.log('=== Citadel Game Data Structure Demo ===\n');
  
  // 1. Create new game
  console.log('1. Creating new game...');
  let gameDoc = createNewGameExample();
  
  // 2. Player joins
  console.log('\n2. Player joining...');
  gameDoc = playerJoinExample(gameDoc, 'Bob');
  
  // 3. Start land placement
  console.log('\n3. Starting land placement...');
  gameDoc = startLandPlacementExample(gameDoc);
  
  // 4. Demonstrate serialization
  console.log('\n4. Serialization example...');
  const { serialized } = serializationExample(gameDoc);
  
  // 5. Create game summary
  console.log('\n5. Game summary...');
  const summary = gameSummaryExample(gameDoc);
  
  console.log('\n=== Demo Complete ===');
  
  return {
    gameDoc,
    serialized,
    summary
  };
}

// For testing in browser console or Node
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).CitadelDemo = {
    runCompleteExample,
    createNewGameExample,
    playerJoinExample,
    startLandPlacementExample
  };
} else {
  // Node environment
  console.log('Citadel Game Data Structures loaded successfully!');
  console.log('Run runCompleteExample() to see a demo');
}
