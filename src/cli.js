import { Command } from 'commander';
import inquirer from 'inquirer';
import { parse } from './parser.js';
import { roll } from './dice-engine.js';
import * as ui from './ui.js'; // Will implement next

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
    if (!options.interactive) { // distinct flag for clarity
      process.exitCode = 1;
    }
  }
}

async function startInteractiveMode(options) {
  ui.displayWelcome();

  // Force verbose in interactive mode unless explicitly silenced (not impl yet)
  // or maybe just default options?
  // Let's keep passed options but interactive usually implies verbose-ish or pretty.
  const sessionOptions = { ...options, interactive: true };

  try {
    while (true) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: 'Roll >',
          prefix: '', // Clean look
          validate: (input) => {
             if (input.trim() === '') return 'Please enter a command.';
             return true;
          }
        }
      ]);

      const input = answers.command.trim();

      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        console.log('Farewell!');
        break;
      }

      // Handle just hitting enter or empty is caught by validate, 
      // but good to be safe.
      
      await handleRoll(input, sessionOptions);
    }
  } catch (error) {
    if (error.name === 'ExitPromptError' || error.message.includes('User force closed')) {
      // User pressed Ctrl+C or similar
      console.log('\nFarewell!');
    } else {
      throw error;
    }
  }
}
