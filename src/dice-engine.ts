import { secureRoll, LIMITS } from './utils.js';
import { DiceCommand, RollResult, Token, KeepDrop, DiceRule } from './types.js';
import { StandardDiceRule } from './rules/StandardDiceRule.js';

// Registry of rules
const rules: DiceRule[] = [
  new StandardDiceRule()
];

/**
 * Rolls a single group of dice using the registered rules.
 */
function rollDiceGroup(token: Token): RollResult {
  const rule = rules.find(r => r.canProcess(token));
  if (!rule) {
    throw new Error(`No rule found to process token type: ${token.type} value: ${token.value}`);
  }
  return rule.roll(token);
}

/**
 * Creates a result for a raw number.
 */
function numberToResult(n: number): RollResult {
  return {
    total: n,
    rolls: [],
    dropped: [],
    modifier: n,
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
    case '/': total = Math.floor(left.total / right.total); break;
    default: throw new Error(`Unknown operator: ${op}`);
  }

  // Merge rolls
  const rolls = [...left.rolls, ...right.rolls];

  // Merge dropped indices
  const shift = left.rolls.length;
  const rightDroppedShifted = right.dropped.map(d => d + shift);
  const dropped = [...left.dropped, ...rightDroppedShifted];

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
