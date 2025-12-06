import { secureRoll, LIMITS } from './utils.js';
import { DiceCommand, RollResult, Token, KeepDrop } from './types.js';

const MAX_EXPLODE_DEPTH = 50;

/**
 * Rolls a single group of dice (e.g., "2d6!kh1").
 */
function rollDiceGroup(token: Token): RollResult {
  if (token.type !== 'DICE' || !token.diceParams) {
    throw new Error('Internal Error: Invalid dice token for rolling.');
  }

  const { count, sides, explode, keepDrop } = token.diceParams;

  // Validation
  if (count > LIMITS.MAX_DICE) {
    throw new Error(`Dice count (${count}) exceeds limit of ${LIMITS.MAX_DICE}.`);
  }
  if (sides > LIMITS.MAX_SIDES) {
    throw new Error(`Dice sides (${sides}) exceeds limit of ${LIMITS.MAX_SIDES}.`);
  }

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
          keepRolling = false; 
        }
      } else {
        keepRolling = false;
      }
    }
  }

  // Keep/Drop Logic
  const droppedIndices: Set<number> = new Set();
  if (keepDrop) {
    const mapped = rolls.map((v, i) => ({ v, i }));
    mapped.sort((a, b) => a.v - b.v);
    
    const len = mapped.length;
    const n = keepDrop.n;
    let indicesToDrop: number[] = [];

    if (keepDrop.type === 'keep') {
      if (keepDrop.dir === 'high') {
        const dropCount = Math.max(0, len - n);
        indicesToDrop = mapped.slice(0, dropCount).map(m => m.i);
      } else {
        const dropCount = Math.max(0, len - n);
        indicesToDrop = mapped.slice(len - dropCount).map(m => m.i);
      }
    } else { // DROP
      if (keepDrop.dir === 'high') {
         const dropCount = Math.min(len, n);
         indicesToDrop = mapped.slice(len - dropCount).map(m => m.i);
      } else {
         const dropCount = Math.min(len, n);
         indicesToDrop = mapped.slice(0, dropCount).map(m => m.i);
      }
    }
    indicesToDrop.forEach(idx => droppedIndices.add(idx));
  }

  // Summation
  let sum = 0;
  rolls.forEach((val, idx) => {
    if (!droppedIndices.has(idx)) {
      sum += val;
    }
  });

  return {
    total: sum,
    rolls,
    dropped: Array.from(droppedIndices),
    modifier: 0, // Individual dice groups don't carry the modifier context anymore
    notation: token.value,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a result for a raw number.
 */
function numberToResult(n: number): RollResult {
  return {
    total: n,
    rolls: [],
    dropped: [],
    modifier: n, // Treat raw numbers as modifiers for now? Or just total?
    notation: n.toString(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Combines two results based on an operator.
 */
function operate(left: RollResult, right: RollResult, op: string): RollResult {
    let total = 0;
    switch (op) {
        case '+': total = left.total + right.total; break;
        case '-': total = left.total - right.total; break;
        case '*': total = left.total * right.total; break;
        case '/': total = Math.floor(left.total / right.total); break; // Integer division for D&D usually?
        default: throw new Error(`Unknown operator: ${op}`);
    }

    // Merge rolls
    const rolls = [...left.rolls, ...right.rolls];
    
    // Merge dropped indices
    // Right indices need to be shifted by the length of left rolls
    const shift = left.rolls.length;
    const rightDroppedShifted = right.dropped.map(d => d + shift);
    const dropped = [...left.dropped, ...rightDroppedShifted];

    // Merge modifiers?
    // If we do "1d6 + 5", left mod=0, right mod=5. New mod=5.
    // If we do "5 + 1d6", left mod=5, right mod=0. New mod=5.
    // If we do "1d6 * 2", left mod=0, right mod=2. This isn't really a "modifier" in the D&D sense anymore.
    // But for the UI's sake, let's sum them if op is +/-, otherwise reset?
    // Let's keep it simple: Sum if +, subtract if -. Zero otherwise.
    let modifier = 0;
    if (op === '+') modifier = left.modifier + right.modifier;
    else if (op === '-') modifier = left.modifier - right.modifier;
    
    return {
        total,
        rolls,
        dropped,
        modifier,
        notation: `(${left.notation} ${op} ${right.notation})`,
        timestamp: new Date().toISOString()
    };
}

export function roll(command: DiceCommand): RollResult {
  const stack: RollResult[] = [];

  for (const token of command.rpn) {
      if (token.type === 'NUMBER') {
          stack.push(numberToResult(token.numberValue!));
      } else if (token.type === 'DICE') {
          stack.push(rollDiceGroup(token));
      } else if (token.type === 'OPERATOR') {
          if (stack.length < 2) throw new Error('Invalid expression: not enough operands.');
          const right = stack.pop()!;
          const left = stack.pop()!;
          stack.push(operate(left, right, token.value));
      }
  }

  if (stack.length !== 1) {
      throw new Error('Invalid expression: stack did not reduce to a single value.');
  }

  const final = stack[0];
  final.notation = command.original; // Restore original input string for display
  return final;
}
