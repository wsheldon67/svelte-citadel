# Citadel Game Data Structures

This document summarizes the core data structures implemented for the Citadel game's Firestore synchronization system.

## Overview

We've implemented an event sourcing pattern where the game state is derived from:
1. **Initial State** - Basic game setup and configuration
2. **Action History** - Chronological list of all game actions

## Core Data Structures

### 📍 Coordinate System (`Coordinate.ts`)
- 2D coordinate system for the infinite game board
- Utility functions for adjacency, distance calculations
- Efficient conversion to/from string keys for Maps

```typescript
interface Coordinate {
  x: number;
  y: number;
}
```

### 🎮 Game State (`GameState.ts`)
- **InitialGameState** - Game setup and configuration
- **GameState** - Complete derived game state
- **GameDocument** - What gets stored in Firestore

```typescript
interface GameDocument {
  initialState: InitialGameState;
  actions: GameAction[];
  currentState: GameState;
  version: number;
}
```

### ⚡ Actions (`GameAction.ts`)
- Base action interface with common fields
- Specific action types for all game operations
- Union type for type-safe action handling

```typescript
type GameAction = 
  | JoinGameAction
  | PlaceLandAction
  | MovePieceAction
  | CapturePieceAction
  // ... and many more
```

### 🏗️ Factory Functions (`GameFactory.ts`)
- `GameFactory` - Create game states and documents
- `ActionFactory` - Create common game actions
- `SerializationUtils` - Firestore serialization helpers

### 🛠️ Utilities (`GameUtils.ts`)
- ID generation for all game entities
- Validation utilities for data integrity
- Helper functions for querying game state

## Key Features

### ✅ Event Sourcing Ready
- All state changes captured as actions
- Complete game history preserved
- Easy undo/replay functionality
- Audit trail for debugging

### ✅ Firestore Optimized
- Efficient serialization/deserialization
- Version control for optimistic updates
- Lightweight game summaries for listings
- Minimal data transfer

### ✅ Type Safe
- Full TypeScript coverage
- Discriminated unions for actions
- Compile-time validation
- Excellent IDE support

### ✅ Extensible
- Easy to add new action types
- Modular piece system ready
- Support for alternative game modes
- Clean separation of concerns

## File Structure

```
src/lib/game/
├── board/
│   └── Coordinate.ts       # 2D coordinate system
├── engine/
│   ├── GameState.ts        # Core state interfaces
│   ├── GameAction.ts       # Action type definitions
│   └── GameFactory.ts      # Factory functions
├── utils/
│   └── GameUtils.ts        # Utilities and helpers
├── examples/
│   └── DataStructureExample.ts  # Usage examples
└── tests/
    └── DataStructures.test.ts    # Unit tests
```

## Usage Examples

### Creating a New Game
```typescript
import { GameFactory } from '$lib/game/engine/GameFactory.js';

const gameDoc = GameFactory.createGameDocument('player_host_123', {
  maxPlayers: 4,
  gameMode: 'standard'
});
```

### Adding Player Actions
```typescript
import { ActionFactory } from '$lib/game/engine/GameFactory.js';

const joinAction = ActionFactory.createJoinGameAction(
  'player_bob_456',
  'Bob'
);

gameDoc.actions.push(joinAction);
gameDoc.version++;
```

### Firestore Integration
```typescript
import { SerializationUtils } from '$lib/game/engine/GameFactory.js';

// Save to Firestore
const serialized = SerializationUtils.serializeGameDocument(gameDoc);
await db.collection('games').doc(gameDoc.currentState.id).set(serialized);

// Load from Firestore
const data = await db.collection('games').doc(gameId).get();
const gameDoc = SerializationUtils.deserializeGameDocument(data.data());
```

## Next Steps

The data structures are now ready for:

1. **State Derivation Engine** - Functions to compute current state from initial state + actions
2. **Piece Implementation** - Individual piece behavior and validation
3. **Firebase Service** - Real-time synchronization and conflict resolution
4. **UI Components** - Reactive components that display and modify game state

## Testing

Run the test suite to verify all data structures:

```bash
npm run test:unit
```

The tests cover:
- Coordinate system operations
- Game state creation and validation
- Action generation and serialization
- ID generation and validation utilities

## Performance Considerations

- **Sparse Storage** - Only store occupied board positions
- **Action Batching** - Group related actions for efficient sync
- **Incremental Updates** - Only sync changed portions of state
- **Caching** - Derived state cached to avoid recomputation
