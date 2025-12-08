import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.fatecastrc');

export interface Config {
    macros: Record<string, string>;
    preferences?: Record<string, any>;
}

const DEFAULT_CONFIG: Config = {
    macros: {},
    preferences: {}
};

function readConfig(): Config {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return DEFAULT_CONFIG;
        }
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (error) {
        console.warn(`Warning: Failed to read config file at ${CONFIG_FILE}. Using default.`);
        return DEFAULT_CONFIG;
    }
}

function writeConfig(config: Config): void {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error: Failed to write config file at ${CONFIG_FILE}.`);
        throw error;
    }
}

export const ConfigManager = {
    getMacro(name: string): string | undefined {
        const config = readConfig();
        return config.macros[name];
    },

    setMacro(name: string, command: string): void {
        const config = readConfig();
        config.macros[name] = command;
        writeConfig(config);
    },

    deleteMacro(name: string): void {
        const config = readConfig();
        if (config.macros[name]) {
            delete config.macros[name];
            writeConfig(config);
        }
    },

    listMacros(): Record<string, string> {
        const config = readConfig();
        return config.macros;
    }
};
