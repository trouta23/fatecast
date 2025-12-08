import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser.js';
import { roll } from '../src/dice-engine.js';

describe('Fudge Dice Rule', () => {
    it('should parse 4dF correctly', () => {
        const command = parse('4dF');
        expect(command.rpn[0].diceParams?.variant).toBe('fudge');
        expect(command.rpn[0].diceParams?.sides).toBe(3);
    });

    it('should roll within range for 4dF (-4 to +4)', () => {
        const command = parse('4dF');
        const result = roll(command);

        expect(result.total).toBeGreaterThanOrEqual(-4);
        expect(result.total).toBeLessThanOrEqual(4);
        expect(result.metadata?.fudge).toBe(true);
        expect(result.rolls).toHaveLength(4);
        result.rolls.forEach(r => {
            expect([-1, 0, 1]).toContain(r);
        });
    });

    it('should handle modifiers with Fudge dice', () => {
        const command = parse('4dF+2');
        const result = roll(command);

        expect(result.total).toBeGreaterThanOrEqual(-2); // -4 + 2
        expect(result.total).toBeLessThanOrEqual(6); // 4 + 2
        expect(result.modifier).toBe(2);
    });
});
