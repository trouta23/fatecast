# ADR 002: Layered Architecture & Separation of Concerns

## Context
CLI tools often suffer from the "God Object" anti-pattern, where parsing, logic, and printing happen in a single file. This makes testing and future GUI integration impossible.

## Decision
We enforce a strict layered architecture:
1.  **CLI/View Layer (`src/cli.ts`, `src/ui.ts`):** Handles I/O.
2.  **Service Layer (`src/parser.ts`):** Pure functions for tokenization and parsing (Shunting Yard).
3.  **Domain Layer (`src/dice-engine.ts`):** Pure business logic.

## Consequences
*   **Rule:** The `Dice Engine` must NEVER import `ui.ts` or `console.log`. It must return data objects (`RollResult`).
*   **Rule:** The `Parser` must be stateless and synchronous.
