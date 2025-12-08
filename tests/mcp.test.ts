import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser.js';
import { roll } from '../src/dice-engine.js';

describe('Defense (McpDef) Dice', () => {
    it('should parse 5dMcpDef correctly', () => {
        const command = parse('5dMcpDef');
        expect(command.rpn[0].diceParams?.variant).toBe('mcp_defense');
        expect(command.rpn[0].diceParams?.count).toBe(5);
        expect(command.rpn[0].diceParams?.sides).toBe(8);
    });

    it('should roll symbols including Block/Crit/Wild/Blank', () => {
        const command = parse('10dMcpDef');
        const result = roll(command);

        expect(result.metadata?.mcp).toBe(true);
        expect(result.metadata?.variant).toBe('mcp_defense');
        // Should have 10 dice + any exploding crits
        expect(result.metadata?.symbols.length).toBeGreaterThanOrEqual(10);

        // Check for valid symbols
        result.metadata?.symbols.forEach((s: string) => {
            expect(['block', 'crit', 'wild', 'blank']).toContain(s);
        });
    });
});

describe('Attack (McpAtk) Dice', () => {
    it('should parse 3dMcpAtk correctly', () => {
        const command = parse('3dMcpAtk');
        expect(command.rpn[0].diceParams?.variant).toBe('mcp_attack');
    });

    it('should roll symbols including Hit/Crit/Wild/Blank', () => {
        const command = parse('10dMcpAtk');
        const result = roll(command);

        expect(result.metadata?.variant).toBe('mcp_attack');

        // Check for valid symbols
        result.metadata?.symbols.forEach((s: string) => {
            expect(['hit', 'crit', 'wild', 'blank']).toContain(s);
        });
    });
});
