import { describe, it, expect } from 'vitest';
import { parse } from './parser.js';
import { TokenType } from './types.js';

describe('Parser (Shunting Yard)', () => {
  it('should parse simple notation', () => {
    const result = parse('2d6');
    expect(result.rpn).toHaveLength(1);
    expect(result.rpn[0].type).toBe('DICE');
    expect(result.rpn[0].diceParams).toMatchObject({ count: 2, sides: 6 });
  });

  it('should parse notation with modifier', () => {
    // 1d20 + 5 -> 1d20 5 +
    const result = parse('1d20+5');
    const types = result.rpn.map(t => t.type);
    expect(types).toEqual(['DICE', 'NUMBER', 'OPERATOR']);
    expect(result.rpn[1].numberValue).toBe(5);
    expect(result.rpn[2].value).toBe('+');
  });

  it('should parse complex math', () => {
    // (1d6 + 2) * 3 -> 1d6 2 + 3 *
    const result = parse('(1d6 + 2) * 3');
    const types = result.rpn.map(t => t.type);
    expect(types).toEqual(['DICE', 'NUMBER', 'OPERATOR', 'NUMBER', 'OPERATOR']);
    expect(result.rpn[2].value).toBe('+');
    expect(result.rpn[4].value).toBe('*');
  });

  it('should parse keep highest (kh)', () => {
    const result = parse('2d20kh1');
    expect(result.rpn[0].diceParams?.keepDrop).toEqual({ type: 'keep', dir: 'high', n: 1 });
  });

  it('should parse drop lowest (dl)', () => {
    const result = parse('4d6dl1');
    expect(result.rpn[0].diceParams?.keepDrop).toEqual({ type: 'drop', dir: 'low', n: 1 });
  });

  it('should parse explode (!)', () => {
    const result = parse('1d6!');
    expect(result.rpn[0].diceParams?.explode).toBe(true);
  });

  it('should parse mixed dice', () => {
    // 1d8 + 1d6 -> 1d8 1d6 +
    const result = parse('1d8 + 1d6');
    const types = result.rpn.map(t => t.type);
    expect(types).toEqual(['DICE', 'DICE', 'OPERATOR']);
  });
  
  it('should throw on unbalanced parens', () => {
      expect(() => parse('(1d6 + 2')).toThrow('Mismatched parentheses');
      expect(() => parse('1d6 + 2)')).toThrow('Mismatched parentheses');
  });

  it('should throw on unknown characters', () => {
    expect(() => parse('1d6 ?')).toThrow('Unexpected character');
  });
});
