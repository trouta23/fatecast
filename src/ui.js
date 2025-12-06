import chalk from 'chalk';

export function displayWelcome() {
  console.log(chalk.bold.magenta('🎲 Welcome to FateCast 🎲'));
  console.log(chalk.dim('Type a dice notation (e.g., "2d20+5") or "exit" to quit.'));
  console.log('');
}

export function display(result, options) {
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Pretty Print
  const { total, rolls, modifier, notation } = result;
  
  // Check for criticals (assuming d20 for simplicity in MVP coloring, 
  // or check if any die had 20 sides and rolled 20/1).
  // The dice engine didn't explicitly pass 'sides' in the result rolls, 
  // but we have 'rolls' array and 'notation'. 
  // Ideally, the Result object should carry 'sides' metadata per roll group 
  // but strictly the Parser had it. 
  // For MVP, let's just display the total brightly.
  
  let totalStr = `${total}`;
  
  // Simple semantic coloring:
  // If strictly 1d20 was rolled (length 1, notation implies d20), colorize.
  // We can infer from notation or just format everything nicely.
  
  if (notation.includes('d20') && rolls.length === 1) {
    if (rolls[0] === 20) {
      totalStr = chalk.bold.green(totalStr) + chalk.bold.yellow(' (CRIT!)');
    } else if (rolls[0] === 1) {
      totalStr = chalk.bold.red(totalStr) + chalk.bold.dim(' (FAIL)');
    } else {
      totalStr = chalk.bold.white(totalStr);
    }
  } else {
    totalStr = chalk.bold.cyan(totalStr);
  }

  if (options.verbose || options.interactive) {
     const rollDetails = rolls.join(', ');
     const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
     console.log(`${chalk.dim('Input:')} ${notation}`);
     console.log(`${chalk.dim('Rolls:')} [${rollDetails}] ${chalk.dim(modStr)}`);
     console.log(`${chalk.bold('Total:')} ${totalStr}`);
     console.log(''); // Spacer
  } else {
     // Pipeline default: just the number
     console.log(total);
  }
}

export function displayError(error, options) {
  if (options.json) {
    console.log(JSON.stringify({ error: error.message }));
    return;
  }
  console.error(chalk.red('Error:'), error.message);
}
