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

## Action Processing

Each action type has its own handler in `GameStateDerivation`:

- ✅ `join-game` → Add player to game
- ✅ `start-game` → Move to land-placement phase  
- ✅ `place-land` → Add land tile to board
- ✅ `place-citadel` → Add citadel at position
- ✅ `select-piece` → Add piece to stash/community pool
- ✅ `place-piece` → Move piece from stash to board
- ✅ `move-piece` → Update piece position
- ✅ `capture-piece` → Move piece to graveyard
- ✅ `end-turn` → Advance to next player
- ✅ `concede` → End game with winner

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

The event sourcing foundation is now solid. Ready for:

1. **Piece Implementation** - Individual piece behavior and validation
2. **Firebase Integration** - Real-time action synchronization
3. **UI Components** - Reactive components using derived state
4. **Game Rules Engine** - Action validation and game logic

The architecture now perfectly supports the technical requirements:
- ✅ **Reviewable Games** - Complete action history
- ✅ **Undo Functionality** - Replay to any point
- ✅ **Simulation Engine** - Test actions without persistence
- ✅ **Alternative Game Modes** - Different rule sets using same actions
