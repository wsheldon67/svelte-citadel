

export class GameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GameError"
  }
}


export class AuthenticationError extends GameError {
  constructor(message: string) {
    super(message)
    this.name = "AuthenticationError"
  }
}


export class RuleViolation extends GameError {
  constructor(message: string) {
    super(message)
    this.name = "RuleViolation"
  }
}