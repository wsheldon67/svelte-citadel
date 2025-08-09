# Modular Action System

We've successfully refactored the action system to eliminate the central bottleneck and make it trivial for piece authors to add new actions without touching core files.

## Key Improvements

### ✅ Before (Centralized System)
- All actions defined in single `GameAction` union type
- Piece authors had to modify core `GameAction.ts`
- Action handlers scattered across `GameStateDerivation`
- Tight coupling between pieces and core system

### ✅ After (Modular Plugin System)
- Pieces define their own action interfaces
- Actions registered dynamically via `ActionRegistry`
- Zero modifications to core files needed
- Clean separation of concerns

## Architecture Overview

### Core Components

1. **BaseActions.ts** - Minimal core actions (join, start, place-land, etc.)
2. **ActionRegistry.ts** - Plugin system for registering actions
3. **CoreActionHandlers.ts** - Handlers for core game actions
4. **ModularGameStateDerivation.ts** - Uses registry instead of switch statement

### How Pieces Define Actions

```typescript
// 1. Define action interfaces
export interface BuilderPlaceLandAction extends BaseGameAction {
  type: 'builder-place-land';
  builderId: string;
  landId: string;
  position: Coordinate;
}

// 2. Register action with handler
defineAction<BuilderPlaceLandAction>(
  'builder-place-land',
  BuilderPiece.handlePlaceLand,  // Handler function
  {
    description: 'Builder places a new land tile',
    allowedPieceTypes: ['builder'],
    validator: BuilderPiece.validatePlaceLand  // Optional validator
  }
);

// 3. Implement handler
private static handlePlaceLand = (state: GameState, action: BuilderPlaceLandAction): GameState => {
  // Custom logic for placing land
  return newState;
};
```

## Benefits for Piece Authors

### 🎯 Zero Core File Changes
- Pieces are completely self-contained
- No need to modify `GameAction` union type
- No need to touch `GameStateDerivation`
- Actions auto-register when piece is imported

### 🎯 Type Safety
- Full TypeScript support for custom actions
- Compile-time validation of action interfaces
- IDE autocompletion for action properties

### 🎯 Validation Framework
- Optional validators for action validation
- Consistent error messaging
- Validation runs before action application

### 🎯 Discoverability
- Actions can be queried by piece type
- Automatic action documentation via registry
- Runtime introspection of available actions

## Example: Adding a New Piece

```typescript
// 1. Create piece file (completely independent)
export class TeleporterPiece {
  // 2. Define custom action
  interface TeleportAction extends BaseGameAction {
    type: 'teleport';
    pieceId: string;
    targetPosition: Coordinate;
  }

  // 3. Register action (zero core file changes!)
  static registerActions() {
    defineAction<TeleportAction>(
      'teleport',
      TeleporterPiece.handleTeleport,
      {
        allowedPieceTypes: ['teleporter'],
        validator: TeleporterPiece.validateTeleport
      }
    );
  }

  // 4. Implement behavior
  private static handleTeleport = (state, action) => {
    // Custom teleport logic
  };
}

// 5. Auto-register when imported
TeleporterPiece.registerActions();
```

## System Benefits

### 🎯 Maintainability
- Pieces are isolated modules
- No central file becomes huge
- Easy to add/remove pieces
- Clear ownership of action logic

### 🎯 Extensibility
- Plugin architecture supports unlimited pieces
- Third-party pieces possible
- A/B testing different piece behaviors
- Hot-swapping piece implementations

### 🎯 Testing
- Pieces can be tested in isolation
- Mock actions easily created
- Registry can be cleared for clean tests
- Action validation tested separately

### 🎯 Performance
- Actions only registered when pieces loaded
- No performance penalty for unused pieces
- Efficient Map-based action lookup
- Lazy loading of piece modules possible

## Registry Features

### Action Management
```typescript
// Check if action supported
ActionRegistry.isRegistered('builder-place-land');

// Get all actions for piece type
ActionRegistry.getActionsForPieceType('builder');

// Apply action via registry
ActionRegistry.applyAction(currentState, action);

// Validate action
ActionRegistry.validateAction(currentState, action);
```

### Runtime Introspection
```typescript
// Get all registered action types
const actionTypes = ActionRegistry.getRegisteredTypes();

// Get action definition
const definition = ActionRegistry.getDefinition('builder-place-land');
console.log(definition.description); // "Builder places a new land tile"
console.log(definition.allowedPieceTypes); // ["builder"]
```

## Migration Path

The system is designed to be incremental:

1. ✅ **Core actions work immediately** - Basic game flow functional
2. ✅ **Pieces register gradually** - Add pieces one by one
3. ✅ **Legacy compatible** - Old action handling still works
4. ✅ **No breaking changes** - Existing code continues working

## Developer Experience

### For Beginners
- Simple `defineAction()` function
- Clear examples to copy
- No need to understand core architecture
- Immediate feedback via validation

### For LLMs
- Predictable pattern for all pieces
- Self-contained action definitions
- Clear function signatures
- Minimal context needed

## Next Steps

The modular action system is now ready for:

1. **Piece Implementation** - Each piece as isolated module
2. **UI Integration** - Actions discovered dynamically
3. **Firebase Sync** - Actions flow through same registry
4. **Game Variations** - Different pieces for different modes

This architecture perfectly fulfills the requirement to "eliminate the number of things that Piece authors have to wire up" - now they wire up nothing in the core system!
