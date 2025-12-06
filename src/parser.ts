import { LIMITS } from './utils.js';
import { DiceCommand } from './types.js';

/**
 * Strictly Anchored Regex for MVP.
 */
const SAFE_REGEX = /^([1-9]\d*)?d([1-9]\d*|%)([a-z]*\d+)?([+-]\d+)?$/i;

/**
 * Parses a dice notation string into a structured command object.
 * @param input - The raw input string.
 * @returns The parsed command object.
 * @throws {Error} If the input is invalid or malformed.
 */
export function parse(input: string): DiceCommand {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string.');
  }

  // 1. Input Truncation (ReDoS Prevention)
  const cleanInput = input.trim().substring(0, LIMITS.MAX_INPUT_LENGTH);

  // 2. Regex Validation
  const match = cleanInput.match(SAFE_REGEX);

  if (!match) {
    throw new Error(`Invalid dice notation: "${cleanInput}". Expected format: XdY+Z (e.g., "2d6+3").`);
  }

  // 3. Extract Groups
  // match[1] = Count (undefined if implicit 1)
  // match[2] = Sides (or '%')
  // match[3] = Special Ops (Keep/Drop)
  // match[4] = Modifier (+/- Z)

  const count = match[1] ? parseInt(match[1], 10) : 1;
  
  let sides: number;
  if (match[2] === '%') {
    sides = 100;
  } else {
    sides = parseInt(match[2], 10);
  }

  let modifier = 0;
  if (match[4]) {
    modifier = parseInt(match[4], 10);
  }
  
  const specialOp = match[3] || null;

  return {
    count,
    sides,
    modifier,
    specialOp,
    original: cleanInput
  };
}
