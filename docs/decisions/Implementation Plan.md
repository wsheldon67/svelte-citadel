# Citadel Game Implementation Plan

## Project Overview
Citadel is a strategic board game built with SvelteKit 5, TypeScript, and Firebase. The game features an infinite 2D grid, unique pieces with complex movement and capture mechanics, terrain manipulation, and real-time multiplayer gameplay.

## Phase 1: Core Game Engine Foundation

### 1.1 Game State Management
**Priority: Critical**

- **Game State Structure**
  - ✅ Immutable game state with event sourcing pattern (initial state + actions, derived state computed on-demand)
  - ✅ Action history for undo/replay functionality
  - ✅ State validation and integrity checks

- **Core Data Types**
  ```typescript
  // Key interfaces implemented
  interface GameState {
    id: string;
    players: Player[];
    board: Board;
    currentPlayer: string;
    phase: GamePhase;
    history: GameAction[];
    citadels: Citadel[];
    graveyard: Piece[];
    communityPool: Piece[];
  }
  
  interface Board {
    lands: Map<Coordinate, Land>;
    pieces: Map<Coordinate, Piece>;
    water: Set<Coordinate>; // Infinite implied
  }
  ```

- **Action System**
  - ✅ Modular action system: plugin/registry pattern, per-piece action registration (no centralized action union)
  - ✅ Core and piece actions registered via ActionRegistry
  - ✅ Action validation and execution pipeline
  - ✅ Rollback mechanism for simulations

### 1.2 Coordinate System & Board
**Priority: Critical**

- **Coordinate System**
  - 2D coordinate system with efficient storage
  - Infinite board simulation with sparse representation
  - Adjacency and pathfinding utilities
  - Distance calculations and area queries

- **Board Management**
  - Land tile placement and removal
  - Water area calculations
  - Citadel connectivity validation
  - Efficient spatial queries for piece interactions

### 1.3 Piece Architecture
**Priority: Critical**

- **Base Piece System**
  - ✅ Extensible piece system with modular action registration
  - ✅ LLM and beginner-friendly API design
  - Action capability framework (`CanMove`, `CanCapture`, `CanPlace`, etc.)
  - Piece state management (position, owner, status)

- **Action Framework**
  ```typescript
  // Modular action registration and validation handled via ActionRegistry and per-piece modules
  abstract class Piece {
    abstract getAvailableActions(gameState: GameState): PieceAction[];
    abstract validateAction(action: PieceAction, gameState: GameState): boolean;
    abstract executeAction(action: PieceAction, gameState: GameState): GameState;
  }
  ```

## Phase 2: Piece Implementation

### 2.1 Basic Pieces
**Priority: High**

- **Soldier** - Basic orthogonal/diagonal movement
- **Bird** - Straight-line movement
- **Rabbit** - Jump movement with special capture rules

### 2.2 Complex Pieces
**Priority: High**

- **Turtle** - Water placement, piece carrying, connectivity rules
- **Builder** - Land manipulation (move, place, remove)
- **Bomber** - Chain reaction mechanics, sacrifice ability
- **Necromancer** - Graveyard interaction
- **Assassin** - Movement through connected pieces, targeting system

### 2.3 Piece Testing Framework
**Priority: High**

- ✅ Comprehensive unit tests for data structures and modular action system
- Movement validation tests
- Capture scenario tests
- Edge case coverage (boundaries, special interactions)

## Phase 3: Game Simulation Engine

### 3.1 Simulation System
**Priority: Critical**

- **Headless Game Simulation**
  - ✅ Simulation without UI dependencies (core engine is headless)
  - ✅ Action validity checking
  - Infinite loop prevention for nested simulations
  - Performance optimization for real-time validation

- **Connectivity Validation**
  - Citadel connection checking algorithm
  - Pathfinding for land connectivity
  - Real-time validation during land manipulation

### 3.2 Game Rules Engine
**Priority: High**

- Win condition detection
- Turn management
- Action sequence validation
- Rule conflict resolution

## Phase 4: User Interface

### 4.1 Game Board UI
**Priority: High**

- **Board Rendering**
  - Infinite grid visualization with viewport management
  - Efficient rendering with virtual scrolling
  - Zoom and pan functionality
  - Responsive design for different screen sizes

- **Interactive Elements**
  - Piece selection and highlighting
  - Valid move indication
  - Drag and drop for piece movement
  - Context menus for complex actions (Builder, etc.)

### 4.2 Game Flow UI
**Priority: High**

- **Setup Phase**
  - Land placement interface
  - Citadel placement
  - Piece selection UI

- **Battle Phase**
  - Turn indicators
  - Action menus
  - Game state display
  - History/undo controls

### 4.3 Piece Action UI
**Priority: Medium**

- Click-to-select piece system
- Highlight valid target tiles
- Floating action menus for complex pieces
- Visual feedback for actions

## Phase 5: Multiplayer & Real-time Features

### 5.1 Firebase Integration
**Priority: High**

- **Real-time Game State**
  - Firebase Firestore for game state storage
  - Real-time listeners for state updates
  - Optimistic updates with conflict resolution
  - Connection state management

- **User Management**
  - Anonymous user support
  - Account upgrade system
  - User authentication and profiles

### 5.2 Lobby System
**Priority: Medium**

- Game creation and configuration
- Join codes for multiplayer
- Player management in lobby
- Game start coordination

### 5.3 Custom Art System
**Priority: Low**

- Art upload and storage
- Art set selection per player
- Default art fallbacks
- Art validation and processing

## Phase 6: Alternative Game Modes

### 6.1 Game Mode Framework
**Priority: Low**

- Pluggable game mode system
- Alternative win conditions
- Variable player counts
- Team-based gameplay

### 6.2 Extended Variations
**Priority: Low**

- Multiple citadels per player
- Capture the flag mode
- Conquest mode
- Defender mode

## Phase 7: Polish & Optimization

### 7.1 Performance Optimization
**Priority: Medium**

- Game state optimization
- UI rendering performance
- Network efficiency
- Memory management

### 7.2 Testing & Quality Assurance
**Priority: High**

- End-to-end testing with Playwright
- Integration testing
- Performance testing
- Cross-browser compatibility

### 7.3 Documentation & Developer Experience
**Priority: Medium**

- ✅ API documentation for event sourcing and modular action system
- ✅ Example piece implementation and guides
- Code examples and tutorials

## Technical Architecture Decisions

### State Management
- ✅ **Event Sourcing**: Game state derived from initial state + action history (implemented)
- ✅ **Immutability**: All state mutations through pure functions
- ✅ **Separation of Concerns**: Game logic independent of UI framework

### Performance Considerations
- **Sparse Board Representation**: Only store occupied coordinates
- **Virtual Rendering**: Render only visible board sections
- **Action Caching**: Cache valid moves to avoid recalculation
- **Simulation Limiting**: Prevent infinite recursion in nested simulations

### API Design Principles
- ✅ **Beginner Friendly**: Intuitive method names and clear documentation
- ✅ **LLM Compatible**: Predictable patterns and clear interfaces
- ✅ **Extensible**: Easy to add new pieces and game modes (via modular action system)
- ✅ **Type Safe**: Full TypeScript coverage with strict typing

## File Structure Recommendations

```
src/
├── lib/
│   ├── game/
│   │   ├── engine/
│   │   │   ├── GameState.ts
│   │   │   ├── GameAction.ts
│   │   │   ├── GameSimulation.ts
│   │   │   └── GameRules.ts
│   │   ├── board/
│   │   │   ├── Board.ts
│   │   │   ├── Coordinate.ts
│   │   │   ├── Land.ts
│   │   │   └── Connectivity.ts
│   │   ├── pieces/
│   │   │   ├── base/
│   │   │   │   ├── Piece.ts
│   │   │   │   ├── PieceAction.ts
│   │   │   │   └── PieceCapabilities.ts
│   │   │   ├── basic/
│   │   │   │   ├── Soldier.ts
│   │   │   │   ├── Bird.ts
│   │   │   │   └── Rabbit.ts
│   │   │   ├── complex/
│   │   │   │   ├── Turtle.ts
│   │   │   │   ├── Builder.ts
│   │   │   │   ├── Bomber.ts
│   │   │   │   ├── Necromancer.ts
│   │   │   │   └── Assassin.ts
│   │   │   └── index.ts
│   │   └── modes/
│   │       ├── StandardMode.ts
│   │       ├── CaptureTheFlag.ts
│   │       └── GameMode.ts
│   ├── ui/
│   │   ├── components/
│   │   │   ├── Board.svelte
│   │   │   ├── Piece.svelte
│   │   │   ├── ActionMenu.svelte
│   │   │   └── GameStatus.svelte
│   │   └── stores/
│   │       ├── gameStore.ts
│   │       ├── uiStore.ts
│   │       └── playerStore.ts
│   ├── firebase/
│   │   ├── gameService.ts
│   │   ├── userService.ts
│   │   └── artService.ts
│   └── utils/
│       ├── validation.ts
│       ├── testing.ts
│       └── helpers.ts
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── game/
│   │   └── [gameId]/
│   │       └── +page.svelte
│   ├── lobby/
│   │   └── +page.svelte
│   └── profile/
│       └── +page.svelte
└── tests/
    ├── game/
    ├── pieces/
    └── integration/
```

## Risk Mitigation

### Technical Risks
- **Complexity of piece interactions**: Mitigate with comprehensive testing and modular design
- **Performance with infinite board**: Address with efficient spatial data structures
- **Real-time synchronization**: Implement robust conflict resolution and rollback mechanisms

### Development Risks
- **Scope creep**: Prioritize core functionality first, extensions later
- **API usability**: Regular validation with beginner developers
- **Cross-browser compatibility**: Early testing across platforms

## Success Metrics

- **Functionality**: All piece types working correctly with edge cases covered
- **Performance**: <100ms action validation, <50ms UI updates
- **Usability**: New pieces can be implemented in <2 hours by beginner developers
- **Stability**: <1% error rate in multiplayer games
- **Extensibility**: Alternative game modes implementable without core changes

This implementation plan provides a structured approach to building the Citadel game while maintaining the flexibility and extensibility requirements outlined in the technical requirements.