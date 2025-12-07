import { Token, RollResult, DiceRule } from '../types.js';
import { secureRoll, LIMITS } from '../utils.js';

export class DaggerheartDiceRule implements DiceRule {
    name = 'DaggerheartDice';

    canProcess(token: Token): boolean {
        return token.type === 'DICE' && token.diceParams?.variant === 'daggerheart';
    }

    roll(token: Token): RollResult {
        if (!token.diceParams) throw new Error('Internal Error: Invalid dice token');

        // In Daggerheart, "count" in "1dh" implies 1 PAIR of dice (Hope + Fear). 
        // But usually people roll just "dh" (count=1). 
        // If they roll "2dh", it might mean 2 pairs? 
        // Let's assume standard usage is count=1. If count > 1, we sum multiple pairs?
        // For simplicity, let's treat count as number of pairs.

        const { count, sides } = token.diceParams;
        // sides is 12.

        const rolls: number[] = [];
        let total = 0;
        // We need to track hope/fear for each pair.
        // metadata will store the result of the FIRST pair if count=1 (most common),
        // or maybe a list if count > 1.

        // Let's simplify: Standard "dh" is count=1.
        // We roll 2 dice: [Hope, Fear].

        const pairResults: Array<{ hope: number, fear: number, outcome: string }> = [];

        for (let i = 0; i < count; i++) {
            // Roll Hope
            const hope = secureRoll(sides);
            // Roll Fear
            const fear = secureRoll(sides);

            rolls.push(hope, fear);
            total += hope + fear;

            let outcome = '';
            if (hope > fear) outcome = 'Hope';
            else if (fear > hope) outcome = 'Fear';
            else outcome = 'Critical';

            pairResults.push({ hope, fear, outcome });
        }

        // Prepare metadata
        // If we have just 1 pair, we can put the details at the top level
        const metadata: Record<string, any> = {
            daggerheart: true,
            pairs: pairResults
        };

        // Construct a narrative based on the first pair?
        // The user might want to know "With Hope" or "With Fear".
        // We'll attach this to the result.

        return {
            total,
            rolls,
            dropped: [],
            modifier: 0,
            notation: token.value,
            timestamp: new Date().toISOString(),
            metadata
        };
    }
}
