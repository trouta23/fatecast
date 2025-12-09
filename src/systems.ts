export interface SystemDefinition {
    name: string;
    description: string;
    aliases: Array<{ pattern: RegExp, replacement: string }>;
}

export const SYSTEMS: Record<string, SystemDefinition> = {
    daggerheart: {
        name: 'Daggerheart',
        description: 'Duality Dice (d -> dh)',
        aliases: [
            { pattern: /(\d+)?d(?![a-z0-9])/gi, replacement: '$1dh' }
        ]
    },
    fudge: {
        name: 'Fate / Fudge',
        description: 'Fate Dice (4d -> 4dF)',
        aliases: [
            { pattern: /(\d+)?d(?![a-z0-9])/gi, replacement: '$1dF' }
        ]
    },
    mcp: {
        name: 'Marvel Crisis Protocol',
        description: 'Attack (dAtk -> dMcpAtk) and Defense (dDef -> dMcpDef)',
        aliases: [
            { pattern: /dAtk/gi, replacement: 'dMcpAtk' },
            { pattern: /dDef/gi, replacement: 'dMcpDef' }
        ]
    }
};

export const listSystems = (): string[] => Object.keys(SYSTEMS);
export const getSystem = (name: string): SystemDefinition | undefined => SYSTEMS[name];
