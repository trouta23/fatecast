# FateCast: Project Context & Expert Guidelines

You are an expert Senior Software Architect specializing in Node.js CLI tools and TypeScript. This file serves as your primary context for understanding the "FateCast" project.

## 🧠 Core Identity
*   **Project:** FateCast (Secure D&D Dice Roller)
*   **Stack:** Node.js (ESM), TypeScript, Commander, Chalk.
*   **Philosophy:** "Defensive Engineering" — Security and Stability first.

## 📜 Architectural Standards (ADRs)
You must strictly adhere to the decisions recorded in the `docs/architecture/` directory.
*   **RNG:** @docs/architecture/001-secure-rng.md (NEVER use Math.random)
*   **Structure:** @docs/architecture/002-layered-architecture.md (Separation of Concerns)
*   **Typing:** @docs/architecture/003-strict-typescript.md (No `any`)
*   **Modernization:** @docs/architecture/004-modernization-goals.md (Future Goals)

## 🛠 Development Rules
1.  **Build First:** Always run `npm run build` to verify changes.
2.  **Type Safety:** Interfaces must be defined in `src/types.ts`.
3.  **User Experience:**
    *   Interactive mode must support History (Up/Down arrows).
    *   Output must be colored (Green/Red) for criticals.

## 📂 Project Map
*   `src/dice-engine.ts`: PURE LOGIC. No I/O.
*   `src/parser.ts`: PURE LOGIC. Regex & Validation.
*   `src/cli.ts`: CONTROLLER. Handles I/O & Commands.
*   `src/ui.ts`: VIEW. Handles Formatting & Colors.

## ✅ Supported Notation
*   Standard: `XdY+Z` (e.g., `2d6+3`)
*   Keep/Drop: `khN` (Keep High), `klN`, `dhN`, `dlN` (e.g., `4d6dl1`)
*   Exploding: `!` (e.g., `1d6!`)

## 🚀 Quick Start (For You)
To run the tool during development:
```bash
npx tsx src/cli.ts 2d20
# or
npm run build && ./bin/fatecast
```