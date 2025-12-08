import { DiceRule, Token, RollResult } from '../types.js';
import { secureRoll } from '../utils.js';

type McpSymbol = 'hit' | 'crit' | 'wild' | 'block' | 'blank' | 'skull';

export class CrisisProtocolDiceRule implements DiceRule {
    name = 'CrisisProtocolDice';

    canProcess(token: Token): boolean {
        return token.type === 'DICE' && (
            token.diceParams?.variant === 'mcp_attack' ||
            token.diceParams?.variant === 'mcp_defense'
        );
    }

    roll(token: Token): RollResult {
        const { diceParams } = token;
        if (!diceParams || !diceParams.variant) throw new Error('Invalid dice token');

        const count = diceParams.count;
        const isAttack = diceParams.variant === 'mcp_attack';

        // Face Distributions (Standard 8-sided dice)
        // Attack (Red): 2 Hits, 1 Crit, 1 Wild, 4 Blanks
        // Defense (Blue): 1 Block, 1 Crit, 1 Wild, 5 Blanks
        // NOTE: Some sources say failure/skull exists?
        // Based on search:
        // Attack: 1 Crit, 1 Wild, 2 Hits, 4 Blanks (Total 8)
        // Defense: 1 Crit, 1 Wild, 1 Block, 5 Blanks (Total 8)
        // (Simplifying "skull" vs blank as blank for now unless confirmed otherwise, 
        // but the search mentioned failure skulls. Let's assume standard blank/skull are failures).

        const rolls: number[] = [];
        const symbols: McpSymbol[] = [];

        // We'll store the raw d8 value (1-8) and map to symbol in metadata
        // Mapping:
        // 8: Crit
        // 7: Wild
        // 6: Hit (Atk) / Block (Def)
        // 5: Hit (Atk) / Blank (Def)
        // 1-4: Blank

        // Let's use a simpler mapping function:

        for (let i = 0; i < count; i++) {
            const val = secureRoll(8);
            rolls.push(val);

            let symbol: McpSymbol = 'blank';

            if (isAttack) {
                // Attack (Red)
                // 8: Crit
                // 7: Wild
                // 6: Hit
                // 5: Hit
                // 1-4: Blank
                if (val === 8) symbol = 'crit';
                else if (val === 7) symbol = 'wild';
                else if (val >= 5) symbol = 'hit';
                else symbol = 'blank';
            } else {
                // Defense (Blue)
                // 8: Crit
                // 7: Wild
                // 6: Block
                // 1-5: Blank
                if (val === 8) symbol = 'crit';
                else if (val === 7) symbol = 'wild';
                else if (val === 6) symbol = 'block';
                else symbol = 'blank';
            }
            symbols.push(symbol);
        }

        // Exploding Crits logic:
        // "Criticals count as successes and allow the player to roll an additional die."
        // We should loop through the initial results and add extra dice for crits.
        // However, "these additional dice do not generate further critical rolls".
        // So distinct pass.

        const extraRolls: number[] = [];
        const extraSymbols: McpSymbol[] = [];

        let critCount = symbols.filter(s => s === 'crit').length;
        for (let i = 0; i < critCount; i++) {
            const val = secureRoll(8);
            extraRolls.push(val);

            // Map extra die
            let symbol: McpSymbol = 'blank';
            if (isAttack) {
                if (val === 8) symbol = 'crit'; // Still a crit symbol, but doesn't trigger roll
                else if (val === 7) symbol = 'wild';
                else if (val >= 5) symbol = 'hit';
                else symbol = 'blank';
            } else {
                if (val === 8) symbol = 'crit';
                else if (val === 7) symbol = 'wild';
                else if (val === 6) symbol = 'block';
                else symbol = 'blank';
            }
            extraSymbols.push(symbol);
        }

        // Combine for display? Or keep separate?
        // For simple roll result, let's append them but mark them.
        // Actually, `rolls` is a flat array. We can just push them.
        rolls.push(...extraRolls);
        symbols.push(...extraSymbols);

        return {
            total: 0, // MCP doesn't have a numeric total usually, just successes.
            // We could calculate successes? (Crit + Wild + Hit/Block)
            // For now, let's leave total as 0 or maybe success count?
            // Let's make total = successes.
            rolls,
            dropped: [],
            modifier: 0,
            notation: token.value,
            timestamp: new Date().toISOString(),
            metadata: {
                mcp: true,
                variant: diceParams.variant,
                symbols
            }
        };
    }
}
