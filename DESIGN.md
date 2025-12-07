# FateCast: D&D Dice Roller - Design Document

## 1. Overview

A command-line application that allows users to roll dice using standard TTRPG notation (e.g., "2d6+3", "1d20-1"). The project, named "FateCast," aims to be a professional-grade utility that is secure, reliable, and user-friendly.

This document outlines the architectural and technical design, incorporating expert feedback to ensure a robust implementation.

## 2. Goals

*   Provide a simple and intuitive command-line interface for both interactive and scripted use.
*   Accurately parse and execute a wide range of dice roll commands.
*   Guarantee statistically fair and unpredictable results through secure random number generation.
*   Deliver a polished and readable output, using color and formatting to enhance clarity.
*   Build a maintainable and testable codebase through a well-defined architecture.

## 3. Non-Goals

*   A graphical user interface (GUI).
*   Character sheets or other complex TTRPG campaign management features.

## 4. Core Architecture

To ensure maintainability, testability, and a clear separation of concerns, the application will follow a layered architecture. This avoids the "God File" anti-pattern where all logic is coupled in a single script.

### 4.1. Architectural Layers

*   **View Layer (CLI & UI):** Responsible for all user interaction. This includes parsing command-line arguments, managing the interactive REPL, and formatting output for display in the terminal.
*   **Model Layer (Dice Engine):** The core business logic of the application. It receives a structured representation of a dice roll command and produces a result. It is completely decoupled from the user interface.
*   **Service Layer (Parser, RNG):** Provides specialized, stateless services to the other layers, such as parsing the dice notation and generating secure random numbers.

### 4.2. Components

*   `bin/fatecast`: The executable entry point. Its only job is to launch the Node.js application.
*   `src/cli.ts`: **CLI Controller.** Uses `commander` to define commands and flags. Manages the application flow, orchestrating calls to the other layers based on user input. It will handle both pipeline and interactive modes.
*   `src/dice-engine.ts`: **Dice Engine.** The heart of the application. It takes a parsed command object (e.g., `{dice: 2, sides: 20, modifier: 5}`) and uses the RNG service to perform the roll, returning a structured `RollResult` object.
*   `src/parser.ts`: **Parser.** Responsible for converting raw string input (e.g., "2d20+5") into a structured, validated command object for the Dice Engine.
*   `src/utils.ts`: **Utilities.** A collection of helper functions, most importantly the `secureRoll` function which wraps Node.js's `crypto.randomInt`.
*   `src/ui.ts`: **Terminal UI View.** Uses `chalk` to format `RollResult` objects for display in the terminal. It will handle semantic coloring (e.g., for critical hits/misses) and respect `NO_COLOR` conventions.

## 5. Technical Details

*   **Language:** TypeScript (Node.js)
*   **Module System:** ES Modules (`"type": "module"` in `package.json`).
*   **Key Dependencies:**
    *   `commander`: For robust command-line argument parsing.
    *   `chalk`: For terminal styling and color.
    *   `readline`: Native Node.js module for interactive history support.

## 6. Parsing Strategy

Parsing user input is a critical and sensitive part of the application. To support complex mathematical expressions and ensuring correctness with the Order of Operations (PEMDAS), we have moved beyond simple regular expressions.

### 6.1. Architecture: Tokenizer & Shunting Yard

The parsing process is now a robust two-stage pipeline:

1.  **Lexer (Tokenizer):** Scans the input string and converts it into a stream of typed `Token` objects (e.g., `DICE(2d6)`, `OPERATOR(+)`, `NUMBER(5)`). It validates characters and handles basic syntax errors.
2.  **Parser (Shunting Yard):** Implements Dijkstra's Shunting Yard algorithm to convert the infix token stream (human-readable) into a Reverse Polish Notation (RPN) queue. This automatically handles operator precedence (`*` before `+`) and parentheses.

### 6.2. Security

*   **Input Sanitization:** All input strings are truncated to a safe length (e.g., 50 characters) *before* tokenization to prevent resource exhaustion.
*   **Validation:** The tokenizer strictly validates allowed characters, preventing code injection or unexpected behavior.

## 7. Random Number Generation (RNG)

The integrity of a dice roller rests on the quality of its randomness. `Math.random()` is a pseudo-random number generator (PRNG) that is not designed for security-sensitive applications and can produce statistically biased results.

*   **Requirement:** All dice rolls must be generated using a cryptographically secure pseudo-random number generator (CSPRNG).
*   **Implementation:** We will use Node.js's built-in `crypto.randomInt` function. This function provides a source of entropy that is suitable for cryptographic use, ensuring fairness and unpredictability.

## 8. User Interaction Models

The application will support two primary modes of operation to serve different user needs.

### 8.1. Pipeline Mode (Non-Interactive)

This mode is for users who want to get a result quickly or use the tool in scripts.
*   **Invocation:** `fatecast 2d8+4`
*   **Output:** By default, it prints only the final result (e.g., `15`). This "silence is golden" approach makes it compatible with Unix pipelines.
*   **Flags:**
    *   `--verbose`: Provides human-readable output (e.g., "Rolled 2d8+4: [5, 6] + 4 = 15").
    *   `--json`: Outputs a machine-readable JSON object with full roll details.

### 8.2. Interactive Mode (REPL)

This mode provides a richer, session-based experience.
*   **Invocation:** `fatecast` (with no arguments).
*   **Implementation:** An asynchronous loop using Node's native `readline` module prompts the user for input.
*   **Features:** Will support command history (up-arrow) and provide a more "application-like" feel than the native `readline` module.

## 9. Defensive Engineering

To ensure the application is stable and secure, we will enforce strict limits on all user inputs.

*   **Input Caps:**
    *   **Dice Quantity:** 500 (Prevents memory exhaustion from large arrays).
    *   **Die Sides:** 1,000 (Sufficient for all standard TTRPGs).
    *   **Modifier:** 1,000 (Keeps totals well within `Number.MAX_SAFE_INTEGER`).
*   **Input Length:** 50 characters (Primary defense against ReDoS).
*   **Memory Management:** For features like roll history, a circular buffer will be used to ensure a constant memory footprint.

## 10. Implemented Features

### 10.1. Advanced Dice Mechanics

*   **Keep/Drop:** `4d6dl1` (roll 4 d6, drop the lowest 1).
*   **Exploding Dice:** `1d6!` (if a 6 is rolled, roll again and add).
*   **Complex Math:** `(1d8 + 2) * 2` (supports parentheses and standard operators).

## 11. Roadmap & Future Enhancements

The following enhancements are planned for future releases.

### 11.1. User Configuration & Macros

*   **Macros:** `fatecast save attack 1d20+7` to save a common roll.
*   **Configuration File:** A `~/.fatecastrc` file to set user preferences (e.g., default to verbose output).

### 11.2. Additional Mechanics
*   **Target Numbers:** `10d6>4` (count the number of dice that roll 4 or higher).

## 12. Future Architecture (Modernization)

To push the design to the "State of the Art," the following architectural shifts are planned (see ADR 004):

1.  **Zero-Dependency:** [ON HOLD] Transition to `util.parseArgs` and `node:test` to minimize external deps.
2.  **Shunting Yard Algorithm:** [COMPLETED] Adopt this algorithm for the Parser to handle complex math and precedence.
3.  **Plugin System:** [COMPLETED] Refactor `DiceEngine` to use a plugin pattern for supporting diverse dice types (`dF`, `d%`).
4.  **Async Context:** Use `AsyncLocalStorage` to manage session state without argument drilling.
