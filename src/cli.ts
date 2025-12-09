import { Command } from 'commander';
import chalk from 'chalk';
import { createInterface } from 'readline';
import { parse } from './parser.js';
import { roll } from './dice-engine.js';
import * as ui from './ui.js';
import { CLIOptions } from './types.js';

import { ConfigManager } from './config.js';

const program = new Command();

export function run(): void {
  program
    .name('fatecast')
    .description('A secure and robust command-line D&D dice roller.')
    .version('1.0.0');

  // Commands
  program
    .command('save')
    .description('Save a reusable dice macro')
    .argument('<name>', 'Name of the macro')
    .argument('<notation>', 'Dice notation to save')
    .action((name, notation) => {
      ConfigManager.setMacro(name, notation);
      console.log(`Saved macro '${name}' as '${notation}'`);
      process.exit(0);
    });

  program
    .command('delete')
    .description('Delete a saved macro')
    .argument('<name>', 'Name of the macro')
    .action((name) => {
      ConfigManager.deleteMacro(name);
      console.log(`Deleted macro '${name}'`);
      process.exit(0);
    });

  program
    .command('list')
    .description('List all saved macros')
    .action(() => {
      const macros = ConfigManager.listMacros();
      if (Object.keys(macros).length === 0) {
        console.log('No saved macros.');
      } else {
        console.log('Saved Macros:');
        for (const [name, cmd] of Object.entries(macros)) {
          console.log(`  ${name}: ${cmd}`);
        }
      }
      process.exit(0);
    });

  // Main Argument (Catch-all for rolling)
  program
    .argument('[notation]', 'Dice notation (e.g., "2d20+5") or macro name')
    .option('--json', 'Output result as JSON')
    .option('--brief', 'Show only the final result')
    .action(async (notation: string | undefined, options: CLIOptions) => {
      if (notation) {
        // Pipeline Mode
        await handleRoll(notation, options);
      } else {
        // Interactive Mode
        await startInteractiveMode(options);
      }
    });

  program.parse();
}

async function handleRoll(notation: string, options: CLIOptions): Promise<void> {
  // Check for macro
  const macro = ConfigManager.getMacro(notation);
  if (macro) {
    // If verbose (NOT brief), let the user know
    if (!options.brief) {
      console.log(`Expanding macro '${notation}' -> '${macro}'`);
    }
    notation = macro;
  }

  try {
    const command = parse(notation);
    const result = roll(command);
    ui.display(result, options);
  } catch (error) {
    if (error instanceof Error) {
      ui.displayError(error, options);
    } else {
      ui.displayError(new Error(String(error)), options);
    }

    // In pipeline mode, exit with error code if something fails
    if (!options.interactive) {
      process.exitCode = 1;
    }
  }
}

async function startInteractiveMode(options: CLIOptions): Promise<void> {
  ui.displayWelcome();

  const sessionOptions: CLIOptions = { ...options, interactive: true };

  // using readline interface for history support
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Roll > '
  });

  rl.prompt();

  // System Context State
  let currentSystem = 'standard';
  const SYSTEM_ALIASES: Record<string, Array<{ pattern: RegExp, replacement: string }>> = {
    mcp: [
      { pattern: /dAtk/gi, replacement: 'dMcpAtk' },
      { pattern: /dDef/gi, replacement: 'dMcpDef' }
    ]
  };

  rl.on('line', async (line) => {
    let input = line.trim();

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      rl.close();
      return;
    }

    if (input) {
      const parts = input.split(' ');
      const cmd = parts[0].toLowerCase();

      if (cmd === 'list') {
        const macros = ConfigManager.listMacros();
        if (Object.keys(macros).length === 0) {
          console.log('No saved macros.');
        } else {
          console.log('Saved Macros:');
          for (const [name, val] of Object.entries(macros)) {
            console.log(`  ${name}: ${val}`);
          }
        }
      } else if (cmd === 'delete' && parts.length > 1) {
        const name = parts[1];
        ConfigManager.deleteMacro(name);
        console.log(`Deleted macro '${name}'`);
      } else if (cmd === 'save' && parts.length > 2) {
        const name = parts[1];
        const notation = parts.slice(2).join(' ');
        ConfigManager.setMacro(name, notation);
        console.log(`Saved macro '${name}' as '${notation}'`);
      } else if (cmd === 'system') {
        if (parts.length > 1) {
          const arg = parts[1].toLowerCase();
          if (arg === 'list') {
            console.log('Available Systems:');
            console.log(`  standard (Default)`);
            const keys = Object.keys(SYSTEM_ALIASES);
            console.log('DEBUG keys:', keys);
            keys.forEach(s => console.log(`  ${s}`));
          } else if (arg === 'standard' || SYSTEM_ALIASES[arg]) {
            currentSystem = arg;
            console.log(`System set to '${arg}'.`);
            if (arg !== 'standard') {
              console.log(chalk.dim(`Aliases active for ${arg}.`));
            }
          } else {
            console.log(chalk.red(`Unknown system '${arg}'. Type 'system list' to see available options.`));
          }
        } else {
          console.log(`Current system: ${currentSystem} (Type 'system list' to see all)`);
        }
      } else {
        // Apply System Aliases if not a command
        if (currentSystem !== 'standard' && SYSTEM_ALIASES[currentSystem]) {
          let original = input;
          SYSTEM_ALIASES[currentSystem].forEach(rule => {
            input = input.replace(rule.pattern, rule.replacement);
          });

          if (input !== original && !options.brief) {
            console.log(chalk.dim(`[${currentSystem.toUpperCase()}] Alias: ${original} -> ${input}`));
          }
        }

        // Default: Roll or expand macro
        await handleRoll(input, sessionOptions);
      }
    }

    rl.prompt();
  }).on('close', () => {
    console.log('Farewell!');
    process.exit(0);
  });
}
