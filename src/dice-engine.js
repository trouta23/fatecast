import { secureRoll, LIMITS } from './utils.js';

/**
 * Executes a parsed dice command.
 * @param {object} command - The parsed command object from src/parser.js.
 * @returns {object} The result of the roll.
 */
export function roll(command) {
  const { count, sides, modifier, specialOp, original } = command;

  // 1. Validation
  if (count > LIMITS.MAX_DICE) {
    throw new Error(`Dice count (${count}) exceeds limit of ${LIMITS.MAX_DICE}.`);
  }
  if (sides > LIMITS.MAX_SIDES) {
    throw new Error(`Dice sides (${sides}) exceeds limit of ${LIMITS.MAX_SIDES}.`);
  }
  if (Math.abs(modifier) > LIMITS.MAX_MODIFIER) {
    throw new Error(`Modifier (${modifier}) exceeds limit of ${LIMITS.MAX_MODIFIER}.`);
  }
  if (specialOp) {
    throw new Error(`Advanced mechanics like '${specialOp}' are not yet supported in this version.`);
  }

  // 2. Execution
  const rolls = [];
  let sum = 0;

  for (let i = 0; i < count; i++) {
    const result = secureRoll(sides);
    rolls.push(result);
    sum += result;
  }

  const total = sum + modifier;

  // 3. Result Construction
  return {
    total,
    rolls,
    modifier,
    notation: original,
    timestamp: new Date().toISOString()
  };
}
