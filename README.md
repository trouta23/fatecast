# FateCast

> A professional-grade, cryptographically secure D&D dice roller for the command line.

**FateCast** is a robust CLI tool designed for Tabletop RPG players and developers who demand reliability, fairness, and security in their dice rolls. Unlike simple scripts, FateCast employs defensive engineering practices and secure random number generation to ensure every roll is truly random and every input is safely parsed.

## Key Features

*   **Cryptographically Secure:** Uses Node.js `crypto.randomInt` instead of `Math.random()` to guarantee statistical fairness and unpredictability.
*   **Robust Parsing:** Features a custom **Shunting Yard** parser and lexer to support complex mathematical expressions and mixed dice types (e.g., `(1d8 + 1d6) * 2`).
*   **Two Modes:**
    *   **Pipeline Mode:** ideal for quick rolls (`fatecast 2d20`) and shell scripting.
    *   **Interactive Mode:** A rich REPL experience with command history and persistent session handling.
*   **Visual Feedback:** Semantic coloring for Critical Hits (Natural 20) and Critical Misses (Natural 1).
*   **Developer Friendly:** Supports JSON output (`--json`) for easy integration into Discord bots or other tools.

## Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) (v14 or higher) installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/dnd-dice-roller.git
   cd dnd-dice-roller
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Run the tool:**

   **Option A: Run Locally (No setup required)**
   Run the script directly from the project folder:
   ```bash
   ./bin/fatecast
   ```

   **Option B: Install Globally (Optional)**
   To use the `fatecast` command anywhere in your terminal, run:
   ```bash
   npm link
   ```
   Then you can simply type:
   ```bash
   fatecast
   ```

## Usage

### Interactive Mode
Simply run the command without arguments to enter the interactive loop.

```bash
fatecast
```
*Type `exit` to quit.*

#### System Context
Switch systems to use convenient shorthand notation.

```bash
Roll > system list
# Available Systems: standard, mcp, daggerheart, fudge

Roll > system mcp
# System set to 'mcp'. Aliases active: dAtk -> dMcpAtk

Roll > 5dAtk
# Rolls Marvel Crisis Protocol Attack Dice automatically
```

#### Macros
Save your favorite rolls for repeated use.

```bash
# Save a macro
fatecast save attack "2d20+5"

# Use it in pipeline mode
fatecast attack

# Use it in interactive mode
Roll > attack
```

#### Managing Macros
```bash
fatecast list          # Show all saved macros
fatecast delete attack # Delete the macro
```

### Pipeline Mode (One-off Rolls)
Pass the dice notation directly as an argument.

```bash
fatecast 2d20+5
# Output: 19
```

### Advanced Mechanics

FateCast supports complex rolling strategies often used in modern TTRPGs:

| Syntax | Description | Example | Use Case |
| :--- | :--- | :--- | :--- |
| `khN` | **Keep Highest N** | `2d20kh1` | D&D 5e Advantage |
| `klN` | **Keep Lowest N** | `2d20kl1` | D&D 5e Disadvantage |
| `dlN` | **Drop Lowest N** | `4d6dl1` | Stat Generation |
| `dh` | **Daggerheart Duality** | `dh+2` | Daggerheart (Hope/Fear) |
| `dF` | **Fudge/Fate Dice** | `4dF` | Fate Core / Fudge |
| `dMcpAtk` | **MCP Attack** | `5dMcpAtk` | Marvel Crisis Protocol |
| `dMcpDef` | **MCP Defense** | `5dMcpDef` | Marvel Crisis Protocol |
| `dhN` | **Drop Highest N** | `4d6dh1` | |
| `!` | **Exploding Dice** | `1d6!` | Shadowrun / WoD (Aces) |
| `(...)` | **Parentheses** | `(1d6+2)*3` | Complex Formulae |

**Examples:**
```bash
# Roll stats (4d6, drop lowest)
fatecast 4d6dl1
# Output:
# Rolls: [3, 5, 6, <s>1</s>]
# Total: 14

# Complex Damage Formula (Weapon + Hex + Mod) * Crit
fatecast "(1d8 + 1d6 + 4) * 2"
```

### Options & Flags

| Flag | Description |
| :--- | :--- |
| `--brief` | Show only the final result (default is Verbose). |
| `--json` | Output the result as a machine-readable JSON object. |
| `--help` | Display the help menu. |

**Examples:**

```bash
# Verbose output
fatecast 8d6
# Output:
# Input: 8d6
# Rolls: [3, 6, 1, 4, 2, 5, 6, 1]
# Total: 28

# JSON output
fatecast 1d20 --json
# Output: { "total": 20, "rolls": [20], "modifier": 0, ... }
```

## Architecture

FateCast follows a layered architecture to ensure maintainability and testability:

1.  **CLI Controller (`src/cli.ts`):** Manages user input and application flow using `commander` and `readline`.
2.  **Parser (`src/parser.ts`):** Validates and structures raw input strings.
3.  **Dice Engine (`src/dice-engine.ts`):** Pure business logic that executes the roll.
4.  **RNG Service (`src/utils.ts`):** Wraps `crypto` for secure entropy.
5.  **UI View (`src/ui.ts`):** Handles terminal formatting and `chalk` styling.

## Testing

The project includes a comprehensive test suite using **Vitest**.

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch
```

## Roadmap

We are actively working towards making FateCast a state-of-the-art reference implementation.

*   **User Macros:** ✅ Save your favorite rolls (`fatecast save attack 2d20+5`).

*   **Advanced Math:** ✅ Implementing the Shunting Yard algorithm for complex expressions.
*   **Plugins:** ✅ A system for custom dice types (Fudge, MCP, Daggerheart).

## License

This project is licensed under the ISC License.