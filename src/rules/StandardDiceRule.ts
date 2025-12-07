import { Token, RollResult, DiceRule } from '../types.js';
import { secureRoll, LIMITS } from '../utils.js';

const MAX_EXPLODE_DEPTH = 50;

export class StandardDiceRule implements DiceRule {
    name = 'StandardDice';

    canProcess(token: Token): boolean {
        return token.type === 'DICE' && !!token.diceParams;
    }

    roll(token: Token): RollResult {
        if (!token.diceParams) {
            throw new Error('Internal Error: Invalid dice token for StandardDiceRule.');
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
            modifier: 0,
            notation: token.value,
            timestamp: new Date().toISOString()
        };
    }
}
