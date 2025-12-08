import { Command } from 'commander';
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

  rl.on('line', async (line) => {
    const input = line.trim();

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
        // Re-join the rest for complex notation
        const notation = parts.slice(2).join(' ');
        ConfigManager.setMacro(name, notation);
        console.log(`Saved macro '${name}' as '${notation}'`);
      } else {
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
