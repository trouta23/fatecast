import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roll } from './dice-engine.js';
import * as utils from './utils.js';
import { DiceCommand } from './types.js';

// Partially mock utils
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
    vi.mocked(utils.secureRoll).mockReturnValueOnce(3).mockReturnValueOnce(4);
    const command: DiceCommand = { 
        count: 2, sides: 6, modifier: 0, explode: false, keepDrop: null, original: '2d6' 
    };
    const result = roll(command);
    expect(result.total).toBe(7);
    expect(result.rolls).toEqual([3, 4]);
  });

  it('should keep highest (Advantage)', () => {
    // Rolls: 5, 15. Keep highest 1 -> 15.
    vi.mocked(utils.secureRoll).mockReturnValueOnce(5).mockReturnValueOnce(15);
    const command: DiceCommand = { 
        count: 2, sides: 20, modifier: 0, explode: false, original: '2d20kh1',
        keepDrop: { type: 'keep', dir: 'high', n: 1 } 
    };
    const result = roll(command);
    expect(result.total).toBe(15);
    expect(result.dropped).toContain(0); // Index 0 (value 5) dropped
  });

  it('should drop lowest (Stat Gen)', () => {
    // Rolls: 2, 4, 5, 6. Drop lowest 1 -> Drop 2. Sum: 15.
    vi.mocked(utils.secureRoll)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(4)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(6);
      
    const command: DiceCommand = { 
        count: 4, sides: 6, modifier: 0, explode: false, original: '4d6dl1',
        keepDrop: { type: 'drop', dir: 'low', n: 1 } 
    };
    const result = roll(command);
    expect(result.total).toBe(15);
    expect(result.dropped).toContain(0); // Index 0 (value 2) dropped
  });

  it('should explode dice', () => {
    // Roll 6 (explode), then 3. Total 9.
    vi.mocked(utils.secureRoll).mockReturnValueOnce(6).mockReturnValueOnce(3);
    const command: DiceCommand = { 
        count: 1, sides: 6, modifier: 0, explode: true, keepDrop: null, original: '1d6!' 
    };
    const result = roll(command);
    expect(result.total).toBe(9);
    expect(result.rolls).toEqual([6, 3]);
  });
});