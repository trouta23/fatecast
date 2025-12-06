import { Command } from 'commander';
import { createInterface } from 'readline';
import { parse } from './parser.js';
import { roll } from './dice-engine.js';
import * as ui from './ui.js'; 
import { CLIOptions } from './types.js';

const program = new Command();

export function run(): void {
  program
    .name('fatecast')
    .description('A secure and robust command-line D&D dice roller.')
    .version('1.0.0')
    .argument('[notation]', 'Dice notation (e.g., "2d20+5" or "(1d6+2)*3")')
    .option('--json', 'Output result as JSON')
    .option('--verbose', 'Show detailed roll results')
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
      await handleRoll(input, sessionOptions);
    }

    rl.prompt();
  }).on('close', () => {
    console.log('Farewell!');
    process.exit(0);
  });
}
