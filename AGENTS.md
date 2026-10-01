# AGENTS.md

## Project

Weather CLI app built with Bun + TypeScript, entrypoint `src/index.ts` (interactive menu loop). The app spec lives in `README.md` (Spanish): fetch weather from OpenMeteo, saved cities, default city, °C/°F setting, and a standalone binary compiled via `bun build --compile` (output: `./weather`).

OpenMeteo requires **no API key**: two-step flow (geocoding → forecast), example URLs in `README.md`.

## Architecture

Layered structure under `src/` (spec in `references/file-system.md`; identifiers stay in Spanish):

- `src/actions/` — one action per menu use case: `getWeather.ts` (opciones 1 y 2), `getForecast.ts` (6), `addCity.ts` (3), `removeCity.ts` (4), `setDefaultCity.ts` (5), `listCities.ts`, `toggleUnit.ts` (8). Actions orchestrate api + storage + presentation and persist through storage immediately.
- `src/presentation/` — ALL user I/O lives here: `menu.ts` (main loop, menu rendering, `MenuOption` dispatch), `input.ts` (single stdin reader + `elegirCiudad` validation), `output.ts` (messages). Note: `elegirCiudad` no longer prints the list; callers print it first via `listarCiudades()` or `imprimirLista()`.
- `src/storage/` — state persisted in `data.json` at repo root (gitignored): `dataFile.ts` (read/write + validation of the whole state), `citiesStorage.ts` (`ciudades` field), `settingsStorage.ts` (`ciudadDefaultId` + `unidad` via `Ajustes`). Both do read-modify-write on the shared file through `dataFile.ts`.
- `src/api/` — OpenMeteo clients `geocoding.ts` / `weather.ts` (typed responses; fields are optional because the API omits them).
- `src/types/` — global contracts: `City.ts`, `Weather.ts` (incl. `RespuestaForecast`), `Geocoding.ts`, `MenuOption.ts`, `State.ts`.
- `src/utils/` — `colors.ts`, `format.ts` (fecha, `etiquetaCiudad`), `constants.ts` (`SEPARADOR`, `ARCHIVO_DATOS`).
- `src/index.ts` — entrypoint: runs `ejecutarMenu()` and catches `EntradaCerrada`.

Gotcha: stdin is read via `data`/`end` events with a line queue (`src/presentation/input.ts`) — do NOT use `node:readline/promises`; in Bun, sequential `rl.question()` calls hang when stdin is piped (verified). EOF surfaces as `EntradaCerrada`.

## Commands

```bash
bun install          # install deps
bun run src/index.ts # run the CLI (alias: bun start; bun dev adds --watch)
bunx tsc --noEmit    # typecheck (tsc comes from peerDependency typescript ^7)
bun test             # run tests (none yet; built into Bun)
bun build --compile --outfile weather src/index.ts   # standalone binary (README goal)
```

Non-interactive smoke test (each action ends with an Enter-pause, so add blank lines):

```bash
printf '3\nOttawa\n1\n\n9\n' | bun run src/index.ts
```

## TypeScript conventions

- `strict` + `noUncheckedIndexedAccess: true` — indexed access (`arr[i]`, `obj[key]`) returns `T | undefined`; handle it explicitly.
- Imports use explicit `.ts` extensions (`allowImportingTsExtensions: true`); tsconfig is `noEmit`, Bun handles execution.
- Zero runtime dependencies — avoid adding libs unless the task requires it.
- User-facing strings are Spanish (see README menu example). File names follow `references/file-system.md` (English).
