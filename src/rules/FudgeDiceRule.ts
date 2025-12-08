import { DiceRule, Token, RollResult } from '../types.js';
import { secureRoll } from '../utils.js';

export class FudgeDiceRule implements DiceRule {
    name = 'FudgeDice';

    canProcess(token: Token): boolean {
        return token.type === 'DICE' && token.diceParams?.variant === 'fudge';
    }

    roll(token: Token): RollResult {
        const { diceParams } = token;
        if (!diceParams) throw new Error('Invalid dice token');

        const count = diceParams.count;
        // Fudge dice are essentially d3s mapped to [-1, 0, 1]
        const rolls: number[] = [];
        let total = 0;

        for (let i = 0; i < count; i++) {
            const raw = secureRoll(3);
            let value = 0;
            if (raw === 1) value = -1;
            else if (raw === 2) value = 0;
            else value = 1; // raw === 3

            rolls.push(value);
            total += value;
        }

        // Handle Keep/Drop (if someone really wants to do 4dFkh2 ???)
        // Standard Fudge doesn't use keep/drop, but the engine allows it.
        // We'll support it for consistency.
        let dropped: number[] = [];
        if (diceParams.keepDrop) {
            // ... (Keep/Drop logic is complex to duplicate here. Ideally we extract it.)
            // But for Fudge, keeping high means keeping +1s.
            // Let's implement basic sorting for K/D support.
            const indexedRolls = rolls.map((val, idx) => ({ val, idx }));
            // Sort descending
            indexedRolls.sort((a, b) => b.val - a.val);

            const { type, n, dir } = diceParams.keepDrop;
            let keepIndices: number[] = [];

            if (type === 'keep') {
                if (dir === 'high') {
                    keepIndices = indexedRolls.slice(0, n).map(r => r.idx);
                } else {
                    keepIndices = indexedRolls.slice(indexedRolls.length - n).map(r => r.idx);
                }
            } else { // drop
                if (dir === 'low') {
                    keepIndices = indexedRolls.slice(0, indexedRolls.length - n).map(r => r.idx);
                } else {
                    keepIndices = indexedRolls.slice(n).map(r => r.idx);
                }
            }

            // Identify dropped indices
            dropped = rolls.map((_, i) => i).filter(i => !keepIndices.includes(i));

            // Recalculate total
            total = rolls.reduce((sum, val, i) => {
                return dropped.includes(i) ? sum : sum + val;
            }, 0);
        }

        // Check for Explode (usually not in Fudge, but engine supports it)
        // We will skip explode for Fudge for simplicity unless requested.

        return {
            total,
            rolls,
            dropped,
            modifier: 0,
            notation: token.value,
            timestamp: new Date().toISOString(),
            metadata: { fudge: true }
        };
    }
}
