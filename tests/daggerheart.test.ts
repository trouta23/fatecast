import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roll } from '../src/dice-engine.js';
import { parse } from '../src/parser.js';
import * as utils from '../src/utils.js';

// Mock secureRoll
vi.mock('../src/utils.js', async (importOriginal) => {
    const actual = await importOriginal<typeof utils>();
    return {
        ...actual,
        secureRoll: vi.fn(),
    };
});

describe('Daggerheart Dice Rule', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should identify Hope vs Fear (Hope wins)', () => {
        // 1dh -> 2 rolls (d12). 
        // mocked: Hope=8, Fear=4. Result should be 12. Outcome: Hope.
        vi.mocked(utils.secureRoll).mockReturnValueOnce(8).mockReturnValueOnce(4);

        const command = parse('dh');
        const result = roll(command);

        expect(result.total).toBe(12);
        expect(result.metadata?.daggerheart).toBe(true);
        expect(result.metadata?.pairs[0]).toEqual({ hope: 8, fear: 4, outcome: 'Hope' });
    });

    it('should identify Hope vs Fear (Fear wins)', () => {
        // mocked: Hope=2, Fear=11. Result 13. Outcome: Fear.
        vi.mocked(utils.secureRoll).mockReturnValueOnce(2).mockReturnValueOnce(11);

        const command = parse('dh');
        const result = roll(command);

        expect(result.total).toBe(13);
        expect(result.metadata?.pairs[0]).toEqual({ hope: 2, fear: 11, outcome: 'Fear' });
    });

    it('should identify Critical (Equal)', () => {
        // mocked: Hope=12, Fear=12. Result 24. Outcome: Critical.
        vi.mocked(utils.secureRoll).mockReturnValueOnce(12).mockReturnValueOnce(12);

        const command = parse('dh');
        const result = roll(command);

        expect(result.total).toBe(24);
        expect(result.metadata?.pairs[0]).toEqual({ hope: 12, fear: 12, outcome: 'Critical' });
    });

    it('should handle modifiers', () => {
        // dh+5. Hope=6, Fear=4. Total 10+5=15.
        vi.mocked(utils.secureRoll).mockReturnValueOnce(6).mockReturnValueOnce(4);

        const command = parse('dh+5');
        const result = roll(command);

        expect(result.total).toBe(15);
        expect(result.metadata?.pairs[0].outcome).toBe('Hope');
    });

    it('should default to 2d12 even if specific numbers are not given', () => {
        // dh implies sides=12. 
        // Just verify it calls roll with 12 sides.
        vi.mocked(utils.secureRoll).mockReturnValue(1);
        roll(parse('dh'));
        expect(utils.secureRoll).toHaveBeenCalledWith(12);
    });
});
