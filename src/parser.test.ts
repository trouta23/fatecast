import { describe, it, expect } from 'vitest';
import { parse } from './parser.js';

describe('Parser', () => {
  it('should parse simple notation', () => {
    const result = parse('2d6');
    expect(result).toMatchObject({ count: 2, sides: 6, modifier: 0 });
  });

  it('should parse notation with modifier', () => {
    const result = parse('1d20+5');
    expect(result).toMatchObject({ count: 1, sides: 20, modifier: 5 });
  });

  it('should parse keep highest (kh)', () => {
    const result = parse('2d20kh1');
    expect(result.keepDrop).toEqual({ type: 'keep', dir: 'high', n: 1 });
  });

  it('should parse drop lowest (dl)', () => {
    const result = parse('4d6dl1');
    expect(result.keepDrop).toEqual({ type: 'drop', dir: 'low', n: 1 });
  });

  it('should parse default keep (k -> kh)', () => {
    const result = parse('2d20k1');
    expect(result.keepDrop).toEqual({ type: 'keep', dir: 'high', n: 1 });
  });

  it('should parse explode (!)', () => {
    const result = parse('1d6!');
    expect(result.explode).toBe(true);
  });

  it('should parse mixed (explode + keep)', () => {
    const result = parse('4d6!kh3');
    expect(result.explode).toBe(true);
    expect(result.keepDrop).toEqual({ type: 'keep', dir: 'high', n: 3 });
  });

  it('should throw on invalid notation', () => {
    expect(() => parse('invalid')).toThrow('Invalid dice notation');
  });
});