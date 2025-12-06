export interface DiceCommand {
  count: number;
  sides: number;
  modifier: number;
  specialOp: string | null;
  original: string;
}

export interface RollResult {
  total: number;
  rolls: number[];
  modifier: number;
  notation: string;
  timestamp: string;
}

export interface CLIOptions {
  json?: boolean;
  verbose?: boolean;
  interactive?: boolean;
}
