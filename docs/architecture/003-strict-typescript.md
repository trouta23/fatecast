# ADR 003: Strict TypeScript Usage

## Context
To maintain a professional-grade codebase, we leverage TypeScript's type system to prevent runtime errors and document intent.

## Decision
*   **Strict Mode:** `tsconfig.json` must have `"strict": true`.
*   **No Any:** Usage of `any` is forbidden. Use `unknown` or specific interfaces.
*   **Shared Types:** All shared interfaces must live in `src/types.ts`.

## Consequences
*   Code must compile with zero errors before committing.
*   We prioritize type safety over development speed.
