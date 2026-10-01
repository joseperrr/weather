# AGENTS.md

## Project

Weather CLI app built with Bun + TypeScript, entrypoint `index.ts` (interactive menu loop). The app spec lives in `README.md` (Spanish): fetch weather from OpenMeteo, saved cities, default city, °C/°F setting, and a standalone binary compiled via `bun build --compile` (output: `./weather`).

OpenMeteo requires **no API key**: two-step flow (geocoding → forecast), example URLs in `README.md`.

## Architecture

Flat modules at repo root:

- `geocoding.ts` / `weather.ts` — OpenMeteo API clients (typed responses; fields are optional because the API omits them).
- `storage.ts` — state persisted in `data.json` at repo root (gitignored); each menu action that mutates state calls `guardarEstado()` immediately.
- `ui.ts` — ALL user I/O lives here, including the single stdin reader.
- `index.ts` — menu loop with README's exact numbering: 1–5, 8, 9 (no 6/7).

Gotcha: stdin is read via `data`/`end` events with a line queue (`ui.ts`) — do NOT use `node:readline/promises`; in Bun, sequential `rl.question()` calls hang when stdin is piped (verified). EOF surfaces as `EntradaCerrada`.

## Commands

```bash
bun install          # install deps
bun run index.ts     # run the CLI
bunx tsc --noEmit    # typecheck (tsc comes from peerDependency typescript ^7)
bun test             # run tests (none yet; built into Bun)
bun build --compile --outfile weather index.ts   # standalone binary (README goal)
```

Non-interactive smoke test (each action ends with an Enter-pause, so add blank lines):

```bash
printf '3\nOttawa\n1\n\n9\n' | bun run index.ts
```

## TypeScript conventions

- `strict` + `noUncheckedIndexedAccess: true` — indexed access (`arr[i]`, `obj[key]`) returns `T | undefined`; handle it explicitly.
- Imports use explicit `.ts` extensions (`allowImportingTsExtensions: true`); tsconfig is `noEmit`, Bun handles execution.
- Zero runtime dependencies — avoid adding libs unless the task requires it.
- User-facing strings are Spanish (see README menu example).
