export interface KeepDrop {
  type: 'keep' | 'drop';
  dir: 'high' | 'low';
  n: number;
}

export interface DiceCommand {
  count: number;
  sides: number;
  modifier: number;
  keepDrop: KeepDrop | null;
  explode: boolean;
  original: string;
}

export interface RollResult {
  total: number;
  rolls: number[];
  dropped: number[]; // Indices or values of dropped dice? Values is easier for display.
  modifier: number;
  notation: string;
  timestamp: string;
}

export interface CLIOptions {
  json?: boolean;
  verbose?: boolean;
  interactive?: boolean;
}