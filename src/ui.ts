import chalk from 'chalk';
import { RollResult, CLIOptions } from './types.js';

export function displayWelcome(): void {
  console.log(chalk.bold.magenta('🎲 Welcome to FateCast 🎲'));
  console.log(chalk.dim('Type a dice notation (e.g., "2d20kh1") or "exit" to quit.'));
  console.log('');
}

export function display(result: RollResult, options: CLIOptions): void {
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Pretty Print
  const { total, rolls, dropped, modifier, notation } = result;

  let totalStr = `${total}`;

  // Highlight Criticals for the Total if it's a single valid d20 roll
  // (Logic gets complex with multiple dice, so simpler is better: Color total by value?)
  // Let's stick to the previous simple logic: if single d20, color total.
  // But now we might have dropped dice.
  // "Effective" rolls = rolls - dropped.
  const keptRolls = rolls.filter((_, i) => !dropped.includes(i));

  if (notation.includes('d20') && keptRolls.length === 1) {
    if (keptRolls[0] === 20) {
      totalStr = chalk.bold.green(totalStr) + chalk.bold.yellow(' (CRIT!)');
    } else if (keptRolls[0] === 1) {
      totalStr = chalk.bold.red(totalStr) + chalk.bold.dim(' (FAIL)');
    } else {
      totalStr = chalk.bold.white(totalStr);
    }
  } else if (result.metadata?.daggerheart) {
    // Daggerheart formatted output
    const pair = result.metadata.pairs[0];
    const outcome = pair.outcome;
    let outcomeStr = '';

    if (outcome === 'Hope') outcomeStr = chalk.bold.yellow(' (HOPE)');
    else if (outcome === 'Fear') outcomeStr = chalk.bold.red(' (FEAR)');
    else outcomeStr = chalk.bold.magenta(' (CRIT!)');

    totalStr = chalk.bold.cyan(totalStr) + outcomeStr;
  } else {
    totalStr = chalk.bold.cyan(totalStr);
  }

  if (!options.brief) {
    const rollDetails = rolls.map((r, i) => {
      if (dropped.includes(i)) {
        return chalk.strikethrough.gray(r);
      }
      // Fudge Dice proper formatting
      if (result.metadata?.fudge) {
        if (r === -1) return chalk.red('[-]');
        if (r === 0) return chalk.gray('[ ]');
        if (r === 1) return chalk.green('[+]');
      }

      // Color individual 20s/1s if it's a d20 roll
      if (notation.includes('d20')) {
        if (r === 20) return chalk.green(r);
        if (r === 1) return chalk.red(r);
      }
      return r.toString();
    }).join(', ');

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

export function displayError(error: Error, options: CLIOptions): void {
  if (options.json) {
    console.log(JSON.stringify({ error: error.message }));
    return;
  }
  console.error(chalk.red('Error:'), error.message);
}