import type { BaseGameAction, GameAction } from './BaseActions.js';

/**
 * Action handler function that applies an action to game state
 */
export type ActionHandler<TAction extends BaseGameAction = BaseGameAction> = (
  currentState: any, // Will be properly typed when we import GameState
  action: TAction
) => any; // Will return properly typed GameState

/**
 * Action validator function that checks if an action is valid
 */
export type ActionValidator<TAction extends BaseGameAction = BaseGameAction> = (
  currentState: any,
  action: TAction
) => boolean | string; // true = valid, false/string = invalid with reason

/**
 * Action definition that pieces can register
 */
export interface ActionDefinition<TAction extends BaseGameAction = BaseGameAction> {
  /** Unique action type identifier */
  type: string;
  
  /** Function to apply this action to game state */
  handler: ActionHandler<TAction>;
  
  /** Function to validate if this action is allowed */
  validator?: ActionValidator<TAction>;
  
  /** Human-readable description for debugging */
  description?: string;
  
  /** Which piece type(s) can perform this action */
  allowedPieceTypes?: string[];
}

/**
 * Central registry for all action types in the game
 * Pieces can register their custom actions here
 */
export class ActionRegistry {
  private static actionDefinitions = new Map<string, ActionDefinition<any>>();
  private static actionHandlers = new Map<string, ActionHandler<any>>();
  private static actionValidators = new Map<string, ActionValidator<any>>();

  /**
   * Register a new action type
   */
  static registerAction<TAction extends BaseGameAction>(
    definition: ActionDefinition<TAction>
  ): void {
    if (ActionRegistry.actionDefinitions.has(definition.type)) {
      console.warn(`Action type "${definition.type}" is already registered. Overwriting.`);
    }

    ActionRegistry.actionDefinitions.set(definition.type, definition as ActionDefinition<any>);
    ActionRegistry.actionHandlers.set(definition.type, definition.handler as ActionHandler<any>);
    
    if (definition.validator) {
      ActionRegistry.actionValidators.set(definition.type, definition.validator as ActionValidator<any>);
    }

    console.log(`Registered action type: ${definition.type}`);
  }

  /**
   * Get the handler for an action type
   */
  static getHandler(actionType: string): ActionHandler<any> | undefined {
    return ActionRegistry.actionHandlers.get(actionType);
  }

  /**
   * Get the validator for an action type
   */
  static getValidator(actionType: string): ActionValidator<any> | undefined {
    return ActionRegistry.actionValidators.get(actionType);
  }

  /**
   * Check if an action type is registered
   */
  static isRegistered(actionType: string): boolean {
    return ActionRegistry.actionDefinitions.has(actionType);
  }

  /**
   * Get all registered action types
   */
  static getRegisteredTypes(): string[] {
    return Array.from(ActionRegistry.actionDefinitions.keys());
  }

  /**
   * Get action definition
   */
  static getDefinition(actionType: string): ActionDefinition<any> | undefined {
    return ActionRegistry.actionDefinitions.get(actionType);
  }

  /**
   * Get all actions that a piece type can perform
   */
  static getActionsForPieceType(pieceType: string): ActionDefinition<any>[] {
    const actions: ActionDefinition<any>[] = [];
    
    for (const definition of ActionRegistry.actionDefinitions.values()) {
      if (!definition.allowedPieceTypes || definition.allowedPieceTypes.includes(pieceType)) {
        actions.push(definition);
      }
    }
    
    return actions;
  }

  /**
   * Clear all registered actions (mainly for testing)
   */
  static clear(): void {
    ActionRegistry.actionDefinitions.clear();
    ActionRegistry.actionHandlers.clear();
    ActionRegistry.actionValidators.clear();
  }

  /**
   * Apply an action using the registered handler
   */
  static applyAction(currentState: any, action: BaseGameAction): any {
    const handler = ActionRegistry.getHandler(action.type);
    
    if (!handler) {
      throw new Error(`No handler registered for action type: ${action.type}`);
    }

    return handler(currentState, action);
  }

  /**
   * Validate an action using the registered validator
   */
  static validateAction(currentState: any, action: BaseGameAction): boolean | string {
    const validator = ActionRegistry.getValidator(action.type);
    
    if (!validator) {
      return true; // No validator means action is always valid
    }

    return validator(currentState, action);
  }
}

/**
 * Decorator function to make action registration easier for pieces
 */
export function registerAction<TAction extends BaseGameAction>(
  actionType: string,
  options: Partial<ActionDefinition<TAction>> = {}
) {
  return function(
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const handler = descriptor.value;
    
    if (typeof handler !== 'function') {
      throw new Error(`@registerAction can only be used on methods`);
    }

    // Register the action when the decorator is applied
    ActionRegistry.registerAction({
      type: actionType,
      handler: handler as ActionHandler<TAction>,
      description: options.description || `${actionType} action`,
      allowedPieceTypes: options.allowedPieceTypes,
      validator: options.validator
    });

    return descriptor;
  };
}

/**
 * Helper function for pieces to easily register actions
 */
export function defineAction<TAction extends BaseGameAction>(
  actionType: string,
  handler: ActionHandler<TAction>,
  options: Partial<ActionDefinition<TAction>> = {}
): void {
  ActionRegistry.registerAction({
    type: actionType,
    handler,
    ...options
  });
}
