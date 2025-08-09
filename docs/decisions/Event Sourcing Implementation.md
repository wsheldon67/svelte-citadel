# Pure Event Sourcing Implementation

We've successfully refactored the Citadel game data structures to implement pure event sourcing, eliminating stored derived state in favor of on-demand computation.

## Key Changes Made

### ✅ Removed Stored Derived State
- **Before**: `GameDocument` included `currentState: GameState`
- **After**: `GameDocument` only contains `initialState` + `actions` + metadata
- **Benefit**: True event sourcing with complete audit trail

### ✅ Added State Derivation Engine
- **New**: `GameStateDerivation` class with `deriveState()` method
- **Purpose**: Compute current state from initial state + action history
- **Performance**: Optimized for turn-based gameplay (not real-time)

### ✅ Updated Serialization
- **Firestore Storage**: Only stores essential event sourcing data
- **Smaller Payload**: No redundant derived state in database
- **Version Control**: Maintains optimistic concurrency with version numbers

## New Architecture

```typescript
// What gets stored in Firestore (minimal)
interface GameDocument {
  initialState: InitialGameState;  // Game setup
  actions: GameAction[];           // Complete history
  version: number;                 // Concurrency control
  lastUpdated: number;            // Query optimization
}

// What gets computed on-demand
interface GameState {
  // Complete current state derived from actions
  players: Player[];
  lands: Land[];
  pieces: Piece[];
  // ... all other state
}
```

## State Derivation Process

```typescript
// Pure function: Initial State + Actions → Current State
const currentState = GameStateDerivation.deriveState(
  gameDoc.initialState, 
  gameDoc.actions
);
```


## Modular Action Processing

Each action type is now handled by a modular plugin system:

- **Core actions** (join-game, start-game, etc.) are registered by the system.
- **Piece actions** are registered by each piece module using the `ActionRegistry`.
- The state derivation engine applies actions by looking up their handler in the registry, not by a hardcoded switch.

This means new actions can be added by simply registering them, with no changes to the core system.

## Performance Considerations

### ✅ Optimized for Turn-Based Games
- Actions applied sequentially (not performance critical)
- State derivation happens when needed, not continuously
- Caching possible at application level

### ✅ Firestore Efficiency
- Smaller documents (no redundant data)
- Efficient queries by `lastUpdated` timestamp
- Action-based real-time subscriptions

## Benefits Achieved

### 🎯 True Event Sourcing
- Complete game history preserved forever
- Any game state can be reconstructed
- Perfect for replay/undo functionality
- Audit trail for debugging

### 🎯 Data Integrity  
- Single source of truth (actions)
- No state synchronization issues
- Impossible to have inconsistent data
- Easy to validate action sequences

### 🎯 Extensibility
- New action types easily added
- Historical games work with new code
- Migration-free schema evolution
- A/B testing different game rules

### 🎯 Debugging & Analytics
- Complete action history for bug reports
- Game analytics from action patterns
- Easy to reproduce issues
- Time-travel debugging possible

## Example Usage

```typescript
// Create game
const gameDoc = GameFactory.createGameDocument(hostId);

// Add actions over time
gameDoc.actions.push(
  ActionFactory.createJoinGameAction(playerId, 'Alice'),
  ActionFactory.createStartGameAction(hostId),
  ActionFactory.createPlaceLandAction(playerId, 0, 0)
);

// Get current state when needed
const currentState = GameStateDerivation.deriveState(
  gameDoc.initialState, 
  gameDoc.actions
);

// Use current state for UI, validation, etc.
console.log(`Game phase: ${currentState.phase}`);
console.log(`Players: ${currentState.players.length}`);
```

## Next Steps

With the event sourcing and modular action system in place, the architecture is ready for:

1. **Piece Implementation** - Each piece as an isolated module with its own actions
2. **Firebase Integration** - Real-time action synchronization
3. **UI Components** - Reactive components using derived state
4. **Game Rules Engine** - Action validation and game logic

This approach perfectly supports the technical requirements:
- ✅ **Reviewable Games** - Complete action history
- ✅ **Undo Functionality** - Replay to any point
- ✅ **Simulation Engine** - Test actions without persistence
- ✅ **Alternative Game Modes** - Different rule sets using same actions
