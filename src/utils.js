import { randomInt } from 'crypto';

/**
 * Defensive Engineering Limits
 */
export const LIMITS = {
  MAX_DICE: 500,
  MAX_SIDES: 1000,
  MAX_MODIFIER: 1000,
  MAX_INPUT_LENGTH: 50,
};

/**
 * Generates a cryptographically secure random integer between 1 and `sides` (inclusive).
 * @param {number} sides - The number of sides on the die.
 * @returns {number} A random integer between 1 and sides.
 * @throws {Error} If sides is less than 1.
 */
export function secureRoll(sides) {
  if (sides < 1) {
    throw new Error('Dice must have at least 1 side.');
  }
  // randomInt(min, max) returns an integer in the range [min, max).
  // So for 1 to sides, we need randomInt(1, sides + 1).
  return randomInt(1, sides + 1);
}
