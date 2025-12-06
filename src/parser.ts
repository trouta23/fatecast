import { LIMITS } from './utils.js';
import { DiceCommand, KeepDrop } from './types.js';

/**
 * Safe Regex for Advanced Mechanics
 * Groups:
 * 1. Count (Optional)
 * 2. Sides (Required, can be '%')
 * 3. Explode (!) (Optional)
 * 4. Keep/Drop (e.g., 'kh1', 'dl2') (Optional)
 * 5. Modifier (+/- Z) (Optional)
 */
const SAFE_REGEX = /^([1-9]\d*)?d([1-9]\d*|%)(!?)([kd][lh]?\d+)?([+-]\d+)?$/i;
const KD_REGEX = /([kd])([lh]?)(\d+)/i;

export function parse(input: string): DiceCommand {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string.');
  }

  // 1. Input Truncation
  const cleanInput = input.trim().substring(0, LIMITS.MAX_INPUT_LENGTH);

  // 2. Regex Validation
  const match = cleanInput.match(SAFE_REGEX);

  if (!match) {
    throw new Error(`Invalid dice notation: "${cleanInput}". Expected format: XdY[!][khN|dlN][+Z]`);
  }

  // 3. Extract Groups
  const count = match[1] ? parseInt(match[1], 10) : 1;
  
  let sides: number;
  if (match[2] === '%') {
    sides = 100;
  } else {
    sides = parseInt(match[2], 10);
  }

  const explode = match[3] === '!';
  
  let keepDrop: KeepDrop | null = null;
  const kdString = match[4];

  if (kdString) {
    const kdMatch = kdString.match(KD_REGEX);
    if (kdMatch) {
      const typeChar = kdMatch[1].toLowerCase();
      const dirChar = kdMatch[2].toLowerCase();
      const n = parseInt(kdMatch[3], 10);

      // Defaults
      let type: 'keep' | 'drop' = typeChar === 'k' ? 'keep' : 'drop';
      let dir: 'high' | 'low';

      if (dirChar === 'h') dir = 'high';
      else if (dirChar === 'l') dir = 'low';
      else {
        // Default direction if omitted
        // k -> kh (Keep High)
        // d -> dl (Drop Low)
        dir = type === 'keep' ? 'high' : 'low';
      }

      keepDrop = { type, dir, n };
    }
  }

  let modifier = 0;
  if (match[5]) {
    modifier = parseInt(match[5], 10);
  }
  
  return {
    count,
    sides,
    modifier,
    explode,
    keepDrop,
    original: cleanInput
  };
}