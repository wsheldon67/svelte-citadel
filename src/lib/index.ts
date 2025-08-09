// Core game engine exports
export * from './game/board/Coordinate.js';
export * from './game/engine/GameState.js';

// Modular action system
export * from './game/engine/BaseActions.js';
export * from './game/engine/ActionRegistry.js';
export * from './game/engine/CoreActionHandlers.js';
export * from './game/engine/ModularGameStateDerivation.js';

// Factories and utilities
export * from './game/engine/GameFactory.js';
export * from './game/utils/GameUtils.js';

// Legacy system (re-export specific items to avoid conflicts)
export { GameActionUtils } from './game/engine/GameAction.js';