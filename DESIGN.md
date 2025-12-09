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

To ensure maintainability, testability, and a clear separation of concerns, the application will follow a layered architecture.

### 4.1. Architectural Layers

*   **View Layer (CLI & UI):** Responsible for all user interaction. This includes parsing command-line arguments, managing the interactive REPL, and formatting output for display in the terminal.
*   **Model Layer (Dice Engine):** The core business logic. It receives a structured representation of a dice roll command and produces a result. It is decoupled from the UI.
*   **Service Layer (Parser, RNG):** Provides specialized, stateless services to the other layers.

### 4.2. Components

*   `bin/fatecast`: Executable entry point.
*   `src/cli.ts`: **CLI Controller.** Manages application flow, REPL state, and System Context switching.
*   `src/dice-engine.ts`: **Dice Engine.** The orchestration layer that delegates rolling logic to specific Rules.
*   `src/parser.ts`: **Parser / Lexer.** Converts strings to structured `Token` streams and ASTs using Shunting Yard.
*   `src/systems.ts`: **System Registry.** Central definitions for game systems and their aliases.
*   `src/utils.ts`: **RNG Service.** Wraps `crypto.randomInt` for secure entropy.
*   `src/ui.ts`: **View.** Handles semantic `chalk` formatting (e.g., criticals, custom symbols).

### 4.3. Plugin Architecture (Dice Rules)
To support diverse game mechanics without polluting the core engine, we use a Plugin pattern.
-   **`DiceRule` Interface:** Defines how a specific die type is rolled and formatted.
-   **Registry:** `DiceEngine` iterates through registered rules (e.g., `CrisisProtocolDiceRule`, `DaggerheartDiceRule`) until one accepts the token.

### 4.4. System Contexts
To resolve syntax collisions (e.g., "d" meaning different things in different games), we use "System Contexts" in the REPL.
-   `src/systems.ts` maps aliases (regex) to canonical dice notation.
-   **Example:** `system fudge` maps input `4d` -> `4dF` (Canonical Fudge Dice).

## 5. Technical Details

*   **Language:** TypeScript (Node.js)
*   **Module System:** ES Modules.
*   **Key Dependencies:** `commander` (CLI), `chalk` (UI), `readline` (REPL).

## 6. Parsing Strategy

### 6.1. Architecture: Tokenizer & Shunting Yard
1.  **Lexer:** Scans input into typed `Token` objects (`DICE`, `OPERATOR`, `NUMBER`).
2.  **Parser:** Uses Shunting Yard algorithm to handle operator precedence and parenthesis, producing an RPN queue for execution.

### 6.2. Security
*   **Input Sanitization:** Inputs truncated to safe lengths.
*   **Validation:** Strict whitelist of allowed characters.

## 7. Random Number Generation (RNG)

*   **Requirement:** Cryptographically Secure Pseudo-Random Number Generator (CSPRNG).
*   **Implementation:** Node.js `crypto.randomInt` (never `Math.random`).

## 8. User Interaction Models

### 8.1. Pipeline Mode
*   **Usage:** `fatecast 2d8+4`
*   **Output:** Silent by default (result only).
*   **Flags:** `--brief` (default hidden), `--json`.

### 8.2. Interactive Mode (REPL)
*   **Usage:** `fatecast`
*   **Features:**
    *   **History:** Up-arrow recall.
    *   **Context:** `system <name>` commands.
    *   **Macros:** `vote save/list/delete`.

## 9. Defensive Engineering

*   **Input Caps:** Dice Quantity (500), Die Sides (1000), Modifiers (1000).
*   **Input Length:** 50 characters.

## 10. Supported Systems & Features

### 10.1. Core Mechanics
*   **Standard:** `XdY+Z`
*   **Keep/Drop:** `khN`, `klN`, `dlN`, `dhN`.
*   **Exploding:** `!` (Standard "Aces").
*   **Math:** Parentheses and PEMDAS support.

### 10.2. Game Systems
*   **Marvel Crisis Protocol:**
    *   **Notation:** `dMcpAtk`, `dMcpDef`.
    *   **Features:** Exploding Crits, Custom Symbols (Hit, Block, Wild, etc.).
*   **Daggerheart:**
    *   **Notation:** `dh` (Duality Dice).
    *   **Features:** Hope vs Fear outcomes.
*   **Fate / Fudge:**
    *   **Notation:** `dF`.
    *   **Features:** `[-1, 0, +1]` mapping.

### 10.3. User Tools
*   **Macros:** Persistent storage in `~/.fatecastrc`.
*   **System Aliases:** Interactive context switching.

## 11. Roadmap

### 11.1. New Systems (Planned)
*   **Star Wars (FFG) / Genesys:** Narrative dice (Success/Failure cancellation).
*   **Vampire (V5):** Hunger dice mechanics.
*   **Legend of the Five Rings:** Roll and Keep with custom symbols.

### 11.2. Architecture
*   **Zero-Dependency:** Migrating to `util.parseArgs` (Node 20+).
*   **Async Context:** Session state management.
