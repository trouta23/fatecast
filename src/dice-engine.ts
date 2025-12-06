import { secureRoll, LIMITS } from './utils.js';
import { DiceCommand, RollResult } from './types.js';

const MAX_EXPLODE_DEPTH = 50;

/**
 * Executes a parsed dice command.
 * @param command - The parsed command object.
 * @returns The result of the roll.
 */
export function roll(command: DiceCommand): RollResult {
  const { count, sides, modifier, keepDrop, explode, original } = command;

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

  // 2. Execution (Rolling)
  const rolls: number[] = [];
  
  for (let i = 0; i < count; i++) {
    let depth = 0;
    let keepRolling = true;
    
    while (keepRolling) {
      const r = secureRoll(sides);
      rolls.push(r);
      
      if (explode && r === sides) {
        depth++;
        if (depth >= MAX_EXPLODE_DEPTH) {
          keepRolling = false; // Safety break
        }
      } else {
        keepRolling = false;
      }
    }
  }

  // 3. Keep/Drop Logic
  const droppedIndices: Set<number> = new Set();

  if (keepDrop) {
    // Map to { value, index } to track original positions
    const mapped = rolls.map((v, i) => ({ v, i }));
    
    // Sort Ascending (Low -> High)
    mapped.sort((a, b) => a.v - b.v);
    
    const len = mapped.length;
    const n = keepDrop.n;
    
    let indicesToDrop: number[] = [];

    if (keepDrop.type === 'keep') {
      if (keepDrop.dir === 'high') {
        // Keep High N -> Drop Low (Len - N)
        const dropCount = Math.max(0, len - n);
        indicesToDrop = mapped.slice(0, dropCount).map(m => m.i);
      } else {
        // Keep Low N -> Drop High (Len - N)
        const dropCount = Math.max(0, len - n);
        indicesToDrop = mapped.slice(len - dropCount).map(m => m.i);
      }
    } else { // DROP
      if (keepDrop.dir === 'high') {
         // Drop High N -> Drop Last N
         const dropCount = Math.min(len, n);
         indicesToDrop = mapped.slice(len - dropCount).map(m => m.i);
      } else {
         // Drop Low N -> Drop First N
         const dropCount = Math.min(len, n);
         indicesToDrop = mapped.slice(0, dropCount).map(m => m.i);
      }
    }
    
    indicesToDrop.forEach(idx => droppedIndices.add(idx));
  }

  // 4. Summation
  let sum = 0;
  rolls.forEach((val, idx) => {
    if (!droppedIndices.has(idx)) {
      sum += val;
    }
  });

  const total = sum + modifier;

  // 5. Result Construction
  return {
    total,
    rolls,
    dropped: Array.from(droppedIndices),
    modifier,
    notation: original,
    timestamp: new Date().toISOString()
  };
}