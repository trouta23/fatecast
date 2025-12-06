# FateCast: D&D Dice Roller - Project Guide

This `GEMINI.md` serves as your personal guide to the **FateCast** project. It outlines how to use the tool, the technical decisions made during its construction, and how to extend it in the future.

## 🚀 Quick Start

### 1. Installation
Ensure you have Node.js installed. Then, from the project root:

```bash
npm install
npm run build # Compiles TypeScript to JavaScript
```

### 2. Running the Tool

**Option A: Run Locally**
Run directly from the project directory:
```bash
./bin/fatecast
./bin/fatecast 2d20+5
```

**Option B: Run Globally (Optional)**
Run `npm link` once to make the command available system-wide:
```bash
npm link
fatecast
```

**Interactive Mode (REPL):**
Ideal for game sessions.
```bash
./bin/fatecast
# Output:
# 🎲 Welcome to FateCast 🎲
# Roll >
```

**Pipeline Mode (One-off):**
Ideal for quick checks or scripts.
```bash
./bin/fatecast 2d20+5
# Output: 25
```

**Verbose Output:**
See the individual die rolls.
```bash
./bin/fatecast 4d6+2 --verbose
# Output:
# Input: 4d6+2
# Rolls: [3, 6, 1, 4] +2
# Total: 16
```

## 🛠 Technical Highlights

This isn't just a toy script; it's engineered for reliability and security.

### 1. Cryptographically Secure RNG
We do **not** use `Math.random()`. Instead, we use Node.js's `crypto.randomInt` in `src/utils.js`.
*   **Why?** `Math.random()` is predictable. `crypto.randomInt` ensures fair, unbiased rolls suitable for high-stakes gameplay.

### 2. Defensive Parsing
The parser in `src/parser.js` uses a **strictly anchored regex** and **input truncation**.
*   **Why?** This prevents "ReDoS" (Regular Expression Denial of Service) attacks where a malicious user could freeze the application with a massive, complex string.
*   **Limit:** Input is capped at 50 characters.

### 3. Architecture
The code is modular, avoiding the "God File" anti-pattern:
*   `bin/fatecast`: Entry point.
*   `src/cli.js`: Controls the flow (Commander/Inquirer).
*   `src/parser.js`: Validates and parses strings.
*   `src/dice-engine.js`: Performs the math and rolling.
*   `src/ui.js`: Handles colors (Chalk) and formatting.

## 📁 Project Structure

```text
.
├── bin/
│   └── fatecast       # Executable entry point
├── src/
│   ├── cli.js         # Command-line controller
│   ├── dice-engine.js # Core logic (rolling, summing)
│   ├── index.js       # Library exports
│   ├── parser.js      # Regex parsing logic
│   ├── ui.js          # Terminal output & coloring
│   └── utils.js       # Secure RNG & constants
├── DESIGN.md          # Detailed architectural documentation
└── package.json       # Dependencies & configuration
```

## 🔮 Future Roadmap

As outlined in `DESIGN.md`, the following features are prepped for future development:

1.  **Advanced Mechanics:** Parsing `kh1` (Keep Highest), `dl1` (Drop Lowest), and `!` (Exploding dice). The parser regex already partially supports capturing these!
2.  **Macros:** Saving common rolls (e.g., `save attack 1d20+5`).
3.  **Config:** Reading a `~/.fatecastrc` file for user preferences.

## 📝 Notes for You

*   **Colors:** Critical hits (Natural 20) turn **Green**. Critical fails (Natural 1) turn **Red**.
*   **JSON:** Use `--json` if you ever want to integrate this with another tool (like a Discord bot).
