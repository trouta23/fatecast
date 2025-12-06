import { Command } from 'commander';
import { createInterface } from 'readline'; // Native Node.js REPL support
import { parse } from './parser.js';
import { roll } from './dice-engine.js';
import * as ui from './ui.js'; 

const program = new Command();

export function run() {
  program
    .name('fatecast')
    .description('A secure and robust command-line D&D dice roller.')
    .version('1.0.0')
    .argument('[notation]', 'Dice notation (e.g., "2d20+5")')
    .option('--json', 'Output result as JSON')
    .option('--verbose', 'Show detailed roll results')
    .action(async (notation, options) => {
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

async function handleRoll(notation, options) {
  try {
    const command = parse(notation);
    const result = roll(command);
    ui.display(result, options);
  } catch (error) {
    ui.displayError(error, options);
    // In pipeline mode, exit with error code if something fails
    if (!options.interactive) { 
      process.exitCode = 1;
    }
  }
}

async function startInteractiveMode(options) {
  ui.displayWelcome();

  const sessionOptions = { ...options, interactive: true };

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
      // We wait for the roll logic, but readline doesn't strictly await event listeners.
      // However, since console.log is sync usually, it's fine.
      await handleRoll(input, sessionOptions);
    }

    rl.prompt();
  }).on('close', () => {
    console.log('Farewell!');
    process.exit(0);
  });
}