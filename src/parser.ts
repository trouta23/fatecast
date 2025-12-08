import { DiceCommand, KeepDrop, Token, TokenType } from './types.js';
import { LIMITS } from './utils.js';

/**
 * Token Patterns
 * ORDER MATTERS! Dice must come before constants/operators if there's ambiguity.
 */
const PATTERNS: [TokenType, RegExp][] = [
    // Dice: XdY, dY, Xdh, dh, dF, dRed, dBlue...
    ['DICE', /([1-9]\d*)?d([1-9]\d*|%|h|f|mcpatk|mcpdef)(!?)([kd][lh]?\d+)?/iy],
    ['NUMBER', /\d+/y],
    ['OPERATOR', /[+\-*/]/y],
    ['PAREN_OPEN', /\(/y],
    ['PAREN_CLOSE', /\)/y],
];

// Operators Precedence
const PRECEDENCE: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
};

// Helper to parse the Dice Token string into params
const KD_REGEX = /([kd])([lh]?)(\d+)/i;
function parseDiceToken(raw: string): Token['diceParams'] {
    const match = raw.match(/^([1-9]\d*)?d([1-9]\d*|%|h|f|mcpatk|mcpdef)(!?)([kd][lh]?\d+)?$/i);
    if (!match) throw new Error(`Internal Error: Failed to re-parse dice token ${raw}`);

    const count = match[1] ? parseInt(match[1], 10) : 1;
    let sides: number;
    let variant: 'standard' | 'daggerheart' | 'fudge' | 'mcp_attack' | 'mcp_defense' = 'standard';

    if (match[2] === '%') {
        sides = 100;
    } else if (match[2].toLowerCase() === 'h') {
        sides = 12; // Daggerheart
        variant = 'daggerheart';
    } else if (match[2].toLowerCase() === 'f') {
        sides = 3; // Fudge
        variant = 'fudge';
    } else if (match[2].toLowerCase() === 'mcpatk') {
        sides = 8;
        variant = 'mcp_attack';
    } else if (match[2].toLowerCase() === 'mcpdef') {
        sides = 8;
        variant = 'mcp_defense';
    } else {
        sides = parseInt(match[2], 10);
    }

    const explode = match[3] === '!';
    let keepDrop: KeepDrop | undefined;
    const kdString = match[4];

    if (kdString) {
        const kdMatch = kdString.match(KD_REGEX);
        if (kdMatch) {
            const typeChar = kdMatch[1].toLowerCase();
            const dirChar = kdMatch[2].toLowerCase();
            const n = parseInt(kdMatch[3], 10);
            let type: 'keep' | 'drop' = typeChar === 'k' ? 'keep' : 'drop';
            let dir: 'high' | 'low' = (type === 'keep' ? 'high' : 'low'); // Default
            if (dirChar === 'h') dir = 'high';
            else if (dirChar === 'l') dir = 'low';
            keepDrop = { type, dir, n };
        }
    }

    return { count, sides, explode, keepDrop, variant };
}

export function tokenize(input: string): Token[] {
    let cursor = 0;
    const tokens: Token[] = [];
    const length = input.length;

    while (cursor < length) {
        // Skip whitespace
        if (/\s/.test(input[cursor])) {
            cursor++;
            continue;
        }

        let matched = false;
        for (const [type, regex] of PATTERNS) {
            regex.lastIndex = cursor; // Sticky regex needs this
            const match = regex.exec(input);
            if (match) {
                const value = match[0];
                const token: Token = { type, value };

                if (type === 'DICE') {
                    token.diceParams = parseDiceToken(value);
                } else if (type === 'NUMBER') {
                    token.numberValue = parseInt(value, 10);
                }

                tokens.push(token);
                cursor += value.length;
                matched = true;
                break;
            }
        }

        if (!matched) {
            throw new Error(`Unexpected character at index ${cursor}: "${input[cursor]}"`);
        }
    }
    return tokens;
}

export function shuntingYard(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
        if (token.type === 'NUMBER' || token.type === 'DICE') {
            outputQueue.push(token);
        } else if (token.type === 'OPERATOR') {
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.type === 'OPERATOR' && (PRECEDENCE[top.value] >= PRECEDENCE[token.value])) {
                    outputQueue.push(operatorStack.pop()!);
                } else {
                    break;
                }
            }
            operatorStack.push(token);
        } else if (token.type === 'PAREN_OPEN') {
            operatorStack.push(token);
        } else if (token.type === 'PAREN_CLOSE') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'PAREN_OPEN') {
                outputQueue.push(operatorStack.pop()!);
            }
            if (operatorStack.length === 0) {
                throw new Error('Mismatched parentheses.');
            }
            operatorStack.pop(); // Pop '('
        }
    }

    while (operatorStack.length > 0) {
        const top = operatorStack.pop()!;
        if (top.type === 'PAREN_OPEN') {
            throw new Error('Mismatched parentheses.');
        }
        outputQueue.push(top);
    }

    return outputQueue;
}

export function parse(input: string): DiceCommand {
    if (!input || typeof input !== 'string') {
        throw new Error('Input must be a non-empty string.');
    }

    const cleanInput = input.trim().substring(0, LIMITS.MAX_INPUT_LENGTH);

    // 1. Tokenize
    const tokens = tokenize(cleanInput);

    // 2. Convert to RPN
    const rpn = shuntingYard(tokens);

    return {
        rpn,
        original: cleanInput
    };
}
