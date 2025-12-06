import { describe, it, expect } from 'vitest';
import { secureRoll, LIMITS } from '../src/utils.js';

describe('Utils', () => {
  describe('secureRoll', () => {
    it('should return a number between 1 and sides', () => {
      const sides = 6;
      for (let i = 0; i < 100; i++) {
        const result = secureRoll(sides);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(sides);
      }
    });

    it('should throw error for invalid sides', () => {
      expect(() => secureRoll(0)).toThrow('Dice must have at least 1 side');
      expect(() => secureRoll(-1)).toThrow('Dice must have at least 1 side');
    });
  });

  describe('LIMITS', () => {
    it('should have safe limits defined', () => {
      expect(LIMITS.MAX_DICE).toBe(500);
      expect(LIMITS.MAX_SIDES).toBe(1000);
      expect(LIMITS.MAX_INPUT_LENGTH).toBe(50);
    });
  });
});
