// Core game engine exports
export * from './game/board/Coordinate';
export * from './game/board/Board';
export * from './game/board/PathfindingUtils';
export * from './game/board/WaterAreaUtils';
export * from './game/board/TurtleUtils';
export * from './game/engine/GameState';

// Modular action system
export * from './game/engine/BaseActions';
export * from './game/engine/ActionRegistry';
export * from './game/engine/CoreActionHandlers';
export * from './game/engine/ModularGameStateDerivation';

// Factories and utilities
export * from './game/engine/GameFactory';
export * from './game/utils/GameUtils';

// Legacy system (re-export specific items to avoid conflicts)
export { GameActionUtils } from './game/engine/GameAction';