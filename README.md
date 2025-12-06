# FateCast 🎲

> A professional-grade, cryptographically secure D&D dice roller for the command line.

**FateCast** is a robust CLI tool designed for Tabletop RPG players and developers who demand reliability, fairness, and security in their dice rolls. Unlike simple scripts, FateCast employs defensive engineering practices and secure random number generation to ensure every roll is truly random and every input is safely parsed.

## ✨ Key Features

*   **Cryptographically Secure:** Uses Node.js `crypto.randomInt` instead of `Math.random()` to guarantee statistical fairness and unpredictability.
*   **Robust Parsing:** Features a strictly anchored regex parser with input sanitization to prevent Regular Expression Denial of Service (ReDoS) attacks.
*   **Two Modes:**
    *   **Pipeline Mode:** ideal for quick rolls (`fatecast 2d20`) and shell scripting.
    *   **Interactive Mode:** A rich REPL experience with command history and persistent session handling.
*   **Visual Feedback:** Semantic coloring for Critical Hits (Natural 20) and Critical Misses (Natural 1).
*   **Developer Friendly:** Supports JSON output (`--json`) for easy integration into Discord bots or other tools.

## 📦 Installation & Setup

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

## 🚀 Usage

### Interactive Mode
Simply run the command without arguments to enter the interactive loop.

```bash
fatecast
```
*Type `exit` to quit.*

### Pipeline Mode (One-off Rolls)
Pass the dice notation directly as an argument.

```bash
fatecast 2d20+5
# Output: 19
```

### Options & Flags

| Flag | Description |
| :--- | :--- |
| `--verbose` | Show detailed breakdown of individual die rolls. |
| `--json` | Output the result as a machine-readable JSON object. |
| `--help` | Display the help menu. |

**Examples:**

```bash
# Verbose output
fatecast 8d6 --verbose
# Output:
# Input: 8d6
# Rolls: [3, 6, 1, 4, 2, 5, 6, 1]
# Total: 28

# JSON output
fatecast 1d20 --json
# Output: { "total": 20, "rolls": [20], "modifier": 0, ... }
```

## 🏗 Architecture

FateCast follows a layered architecture to ensure maintainability and testability:

1.  **CLI Controller (`src/cli.ts`):** Manages user input and application flow using `commander` and `readline`.
2.  **Parser (`src/parser.ts`):** Validates and structures raw input strings.
3.  **Dice Engine (`src/dice-engine.ts`):** Pure business logic that executes the roll.
4.  **RNG Service (`src/utils.ts`):** Wraps `crypto` for secure entropy.
5.  **UI View (`src/ui.ts`):** Handles terminal formatting and `chalk` styling.

## 🧪 Testing

The project includes a comprehensive test suite using **Vitest**.

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch
```

## 📝 License

This project is licensed under the ISC License.