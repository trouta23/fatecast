# ADR 004: Future Architecture Modernization Goals

## Context
To ensure "FateCast" remains a state-of-the-art reference implementation for Node.js CLI tools, we have identified key architectural shifts based on modern Node.js capabilities (v20+) and industry patterns.

## Decisions

### 1. Zero-Dependency Standard (Node.js Native Tooling)
*   **Goal:** Remove heavy dependencies where native equivalents exist.
*   **Strategy:** 
    *   Replace `commander` with `util.parseArgs` (native argument parsing).
    *   Replace `vitest` with `node:test` (native test runner).
*   **Benefit:** Faster install, smaller binary, no dependency drift.

### 2. Shunting Yard Algorithm for Parsing
*   **Goal:** Support complex mathematical expressions (Order of Operations) robustly.
*   **Strategy:** Replace the current Regex-based parser with a proper Lexer/Parser implementing Dijkstra's Shunting Yard Algorithm.
*   **Benefit:** Handles `1d20 + 2d6 * 2` correctly (PEMDAS).

### 3. Plugin Architecture
*   **Goal:** Prevent the `DiceEngine` from becoming a monolithic "God Class".
*   **Strategy:** Implement a `DiceRule` interface to support custom dice (e.g., Fudge dice `dF`, Exploding `d6!`) as isolated plugins.
*   **Benefit:** Infinite extensibility without core code modification.

### 4. Async Local Storage
*   **Goal:** Clean context propagation without prop-drilling.
*   **Strategy:** Use `AsyncLocalStorage` to store session context (trace IDs, user preferences like verbose logging) globally across the call stack.
*   **Benefit:** Simplifies function signatures and prepares the engine for web/server contexts.
