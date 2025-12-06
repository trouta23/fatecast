import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roll } from './dice-engine.js';
import * as utils from './utils.js';
import { DiceCommand } from './types.js';

// Partially mock utils (keep LIMITS, mock secureRoll)
vi.mock('./utils.js', async (importOriginal) => {
  const actual = await importOriginal<typeof utils>();
  return {
    ...actual,
    secureRoll: vi.fn(),
  };
});

describe('Dice Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sum rolls correctly', () => {
    // Mock secureRoll to return 3, then 4
    vi.mocked(utils.secureRoll).mockReturnValueOnce(3).mockReturnValueOnce(4);

    const command: DiceCommand = { count: 2, sides: 6, modifier: 0, specialOp: null, original: '2d6' };
    const result = roll(command);

    expect(result.total).toBe(7); // 3 + 4
    expect(result.rolls).toEqual([3, 4]);
  });

  it('should apply modifier correctly', () => {
    vi.mocked(utils.secureRoll).mockReturnValue(5); // Always return 5

    const command: DiceCommand = { count: 1, sides: 20, modifier: 3, specialOp: null, original: '1d20+3' };
    const result = roll(command);

    expect(result.total).toBe(8); // 5 + 3
    expect(result.modifier).toBe(3);
  });

  it('should enforce MAX_DICE limit', () => {
    const command: DiceCommand = { count: 1000, sides: 6, modifier: 0, specialOp: null, original: '1000d6' };
    expect(() => roll(command)).toThrow(/exceeds limit/);
  });
});
