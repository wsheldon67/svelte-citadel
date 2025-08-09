# Citadel Game To-Do List

This file tracks the progress of the Citadel game implementation, based on the Implementation Plan. Completed items are checked off. Update this file as work progresses.

## Phase 1: Core Game Engine Foundation

### 1.1 Game State Management
- [x] Immutable game state with event sourcing pattern (initial state + actions, derived state computed on-demand)
- [x] Action history for undo/replay functionality
- [x] State validation and integrity checks
- [x] Modular action system: plugin/registry pattern, per-piece action registration (no centralized action union)
- [x] Core and piece actions registered via ActionRegistry
- [x] Action validation and execution pipeline
- [x] Rollback mechanism for simulations

### 1.2 Coordinate System & Board
- [ ] 2D coordinate system with efficient storage
- [ ] Infinite board simulation with sparse representation
- [ ] Adjacency and pathfinding utilities
- [ ] Distance calculations and area queries
- [ ] Land tile placement and removal
- [ ] Water area calculations
- [ ] Citadel connectivity validation
- [ ] Efficient spatial queries for piece interactions

### 1.3 Piece Architecture
- [x] Extensible piece system with modular action registration
- [x] LLM and beginner-friendly API design
- [ ] Action capability framework (`CanMove`, `CanCapture`, `CanPlace`, etc.)
- [ ] Piece state management (position, owner, status)

## Phase 2: Piece Implementation

### 2.1 Basic Pieces
- [ ] Soldier - Basic orthogonal/diagonal movement
- [ ] Bird - Straight-line movement
- [ ] Rabbit - Jump movement with special capture rules

### 2.2 Complex Pieces
- [ ] Turtle - Water placement, piece carrying, connectivity rules
- [ ] Builder - Land manipulation (move, place, remove)
- [ ] Bomber - Chain reaction mechanics, sacrifice ability
- [ ] Necromancer - Graveyard interaction
- [ ] Assassin - Movement through connected pieces, targeting system

### 2.3 Piece Testing Framework
- [x] Comprehensive unit tests for data structures and modular action system
- [ ] Movement validation tests
- [ ] Capture scenario tests
- [ ] Edge case coverage (boundaries, special interactions)

## Phase 3: Game Simulation Engine

### 3.1 Simulation System
- [x] Simulation without UI dependencies (core engine is headless)
- [x] Action validity checking
- [ ] Infinite loop prevention for nested simulations
- [ ] Performance optimization for real-time validation
- [ ] Citadel connection checking algorithm
- [ ] Pathfinding for land connectivity
- [ ] Real-time validation during land manipulation

### 3.2 Game Rules Engine
- [ ] Win condition detection
- [ ] Turn management
- [ ] Action sequence validation
- [ ] Rule conflict resolution

## Phase 4: User Interface

### 4.1 Game Board UI
- [ ] Infinite grid visualization with viewport management
- [ ] Efficient rendering with virtual scrolling
- [ ] Zoom and pan functionality
- [ ] Responsive design for different screen sizes
- [ ] Piece selection and highlighting
- [ ] Valid move indication
- [ ] Drag and drop for piece movement
- [ ] Context menus for complex actions (Builder, etc.)

### 4.2 Game Flow UI
- [ ] Land placement interface
- [ ] Citadel placement
- [ ] Piece selection UI
- [ ] Turn indicators
- [ ] Action menus
- [ ] Game state display
- [ ] History/undo controls

### 4.3 Piece Action UI
- [ ] Click-to-select piece system
- [ ] Highlight valid target tiles
- [ ] Floating action menus for complex pieces
- [ ] Visual feedback for actions

## Phase 5: Multiplayer & Real-time Features

### 5.1 Firebase Integration
- [ ] Firebase Firestore for game state storage
- [ ] Real-time listeners for state updates
- [ ] Optimistic updates with conflict resolution
- [ ] Connection state management
- [ ] Anonymous user support
- [ ] Account upgrade system
- [ ] User authentication and profiles

### 5.2 Lobby System
- [ ] Game creation and configuration
- [ ] Join codes for multiplayer
- [ ] Player management in lobby
- [ ] Game start coordination

### 5.3 Custom Art System
- [ ] Art upload and storage
- [ ] Art set selection per player
- [ ] Default art fallbacks
- [ ] Art validation and processing

## Phase 6: Alternative Game Modes

### 6.1 Game Mode Framework
- [ ] Pluggable game mode system
- [ ] Alternative win conditions
- [ ] Variable player counts
- [ ] Team-based gameplay

### 6.2 Extended Variations
- [ ] Multiple citadels per player
- [ ] Capture the flag mode
- [ ] Conquest mode
- [ ] Defender mode

## Phase 7: Polish & Optimization

### 7.1 Performance Optimization
- [ ] Game state optimization
- [ ] UI rendering performance
- [ ] Network efficiency
- [ ] Memory management

### 7.2 Testing & Quality Assurance
- [ ] End-to-end testing with Playwright
- [ ] Integration testing
- [ ] Performance testing
- [ ] Cross-browser compatibility

### 7.3 Documentation & Developer Experience
- [x] API documentation for event sourcing and modular action system
- [x] Example piece implementation and guides
- [ ] Code examples and tutorials

---

Update this file as you complete or add tasks. For details, see the Implementation Plan.
