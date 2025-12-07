export interface KeepDrop {
  type: 'keep' | 'drop';
  dir: 'high' | 'low';
  n: number;
}

export type TokenType = 'NUMBER' | 'DICE' | 'OPERATOR' | 'PAREN_OPEN' | 'PAREN_CLOSE';

export interface Token {
  type: TokenType;
  value: string;
  // Pre-parsed data for DICE tokens to avoid re-parsing during evaluation
  diceParams?: {
    count: number;
    sides: number;
    keepDrop?: KeepDrop;
    explode?: boolean;
  };
  // Pre-parsed value for NUMBER tokens
  numberValue?: number;
}

export interface DiceCommand {
  rpn: Token[]; // Reverse Polish Notation queue
  original: string;
}

export interface RollResult {
  total: number;
  rolls: number[]; // Flat list of all dice rolled
  dropped: number[]; // Indices of dropped dice in the flat list
  modifier: number; // The final static modifier applied (simplified)
  notation: string;
  timestamp: string;
  // Optional: For future complex UI
  children?: RollResult[];
}

export interface CLIOptions {
  json?: boolean;
  verbose?: boolean;
  interactive?: boolean;
}

export interface DiceRule {
  name: string;
  canProcess(token: Token): boolean;
  roll(token: Token): RollResult;
}