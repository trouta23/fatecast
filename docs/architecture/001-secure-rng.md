# ADR 001: Cryptographically Secure Random Number Generation

## Context
Standard pseudo-random number generators (PRNGs) like `Math.random()` are deterministic and not suitable for applications requiring high fairness or security. In a dice roller, "true" randomness is the core feature.

## Decision
We mandate the use of Node.js's `crypto.randomInt` for all dice generation.

## Consequences
*   **Positive:** Eliminates statistical bias. Prevents prediction attacks.
*   **Negative:** Slightly slower than `Math.random()` (negligible for this use case).
*   **Rule:** `Math.random()` is strictly forbidden in the `src/dice-engine.ts` or `src/utils.ts`.
