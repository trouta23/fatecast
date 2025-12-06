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

  it('should parse negative modifier', () => {
    const result = parse('3d8-2');
    expect(result).toMatchObject({ count: 3, sides: 8, modifier: -2 });
  });

  it('should handle implicit count', () => {
    const result = parse('d12');
    expect(result).toMatchObject({ count: 1, sides: 12 });
  });

  it('should handle percentile dice (d%)', () => {
    const result = parse('2d%');
    expect(result).toMatchObject({ count: 2, sides: 100 });
  });

  it('should throw on invalid notation', () => {
    expect(() => parse('invalid')).toThrow('Invalid dice notation');
    expect(() => parse('2d')).toThrow(); // missing sides
    expect(() => parse('d')).toThrow(); // missing sides
  });

  it('should throw on empty string', () => {
     expect(() => parse('')).toThrow();
  });
});
