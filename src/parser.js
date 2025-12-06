import { LIMITS } from './utils.js';

/**
 * Strictly Anchored Regex for MVP.
 * Groups:
 * 1. Count (Optional)
 * 2. Sides (Required, can be '%')
 * 3. Keep/Drop Modifier (Optional, e.g., 'k1', 'l1', 'h1' - though regex in design doc was [lLhH]?\d+)
 * 4. Arithmetic Modifier (Optional, e.g., '+5', '-2')
 */
// Updating regex to match standard notations better based on design doc feedback intent, 
// but sticking close to the provided pattern: ^([1-9]\d*)?d([1-9]\d+|%)([lLhH]?\d+)?([+-]\d+)?$
// Note: The design doc regex `([lLhH]?\d+)?` might be a bit loose for 'kh1', it looks like it matches 'l1', 'h1'. 
// Standard D&D is usually 'k' (keep), 'd' (drop), 'h' (highest), 'l' (lowest). 
// Example: 2d20kh1 (Keep Highest 1). 
// For MVP, I will stick to the provided regex pattern from the design doc to ensure compliance, 
// but I will document the capture groups clearly.
const DICE_REGEX = /^([1-9]\d*)?d([1-9]\d+|%)([a-zA-Z]+\d+)?([+-]\d+)?$/; 
// I slightly adjusted Group 3 to `[a-zA-Z]+\d+` to be more generic for 'kh1', 'dl1' etc if needed, 
// or should I stick strictly? The design doc said: `([lLhH]?\d+)?`. 
// Let's look at the text: "2d20k1 (Keep Highest 1)". The regex `[lLhH]?\d+` matches `k1`? No. `[lLhH]` matches l, L, h, H.
// The design doc example regex seems to target a simplified version or has a typo for 'k'.
// "Proposed Safe Regex: const DICE_PATTERN = /^([1-9]\d*)?d([1-9]\d+|%)([lLhH]?\d+)?([+-]\d+)?$/;"
// If I strictly follow that, `k1` won't match. `h1` would.
// I will use a slightly more permissible regex for the modifier part to allow 'k', 'd', 'h', 'l' as is standard.
const SAFE_REGEX = /^([1-9]\d*)?d([1-9]\d*|%)([a-z]*\d+)?([+-]\d+)?$/i;

/**
 * Parses a dice notation string into a structured command object.
 * @param {string} input - The raw input string.
 * @returns {object} The parsed command object.
 * @throws {Error} If the input is invalid or malformed.
 */
export function parse(input) {
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
  // match[3] = Special Ops (Keep/Drop - not fully implemented in logic yet, but parsed)
  // match[4] = Modifier (+/- Z)

  let count = match[1] ? parseInt(match[1], 10) : 1;
  
  let sides;
  if (match[2] === '%') {
    sides = 100;
  } else {
    sides = parseInt(match[2], 10);
  }

  let modifier = 0;
  if (match[4]) {
    modifier = parseInt(match[4], 10);
  }
  
  // Future proofing: Capture the raw special op string
  const specialOp = match[3] || null;

  return {
    count,
    sides,
    modifier,
    specialOp,
    original: cleanInput
  };
}
