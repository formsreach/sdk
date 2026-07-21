# Separate package tests into `tests/` folders

**Date:** 2026-07-21  
**Status:** Approved  
**Scope:** `@formsreach/js`, `@formsreach/react`, `@formsreach/vue`

## Problem

Unit tests for `@formsreach/js` live next to production modules under `packages/js/src/` (`*.test.ts`). That mixes build/source concerns, requires `tsconfig` excludes for tests, and does not establish a clear monorepo convention for React/Vue packages (which currently have no tests).

## Goals

1. Keep production code under `src/` only (no `*.test.ts` in `src/`).
2. Use a dedicated `tests/` folder at each package root.
3. Apply the same layout convention to all three packages.
4. Import source modules from tests via a `@/` path alias.

## Non-goals

- Writing new React or Vue test cases
- Shared root-level Vitest config
- Coverage tooling or CI matrix changes
- Renaming test modules beyond the folder move

## Decisions

| Topic | Decision |
|---|---|
| Scope | All three packages now |
| Folder | `tests/` at package root |
| File layout | Mirror `src/` names (`tests/client.test.ts` ↔ `src/client.ts`) |
| Imports | `@/*` maps to `./src/*` |
| Empty packages | Track empty `tests/` with `.gitkeep` |
| Docs | Document convention in `AGENTS.md` |

## Target layout

```
packages/js/
  src/                 # production only
  tests/
    client.test.ts
    init.test.ts
    serialize.test.ts
  vitest.config.ts
  tsconfig.json

packages/react/
  src/
  tests/
    .gitkeep
  vitest.config.ts
  tsconfig.json

packages/vue/
  src/
  tests/
    .gitkeep
  vitest.config.ts
  tsconfig.json
```

## Configuration

### Vitest (per package)

- `test.include`: `["tests/**/*.test.ts"]`
- `resolve.alias`: `"@"` → absolute path to `./src`
- `@formsreach/js` keeps `environment: "happy-dom"` (DOM usage in `init` tests)
- React/Vue use the same include + alias; environment optional until real tests exist
- React/Vue keep `vitest run --passWithNoTests`

### TypeScript (per package)

- `baseUrl`: `"."`
- `paths`: `{ "@/*": ["./src/*"] }`
- Keep package `include` focused on `src` for `tsc --noEmit`
- Remove obsolete `**/*.test.ts` excludes once tests leave `src/`
- Do not add a separate `tsconfig.tests.json` unless needed later

### Import style in tests

```ts
// before (colocated)
import { submitForm } from "./client";

// after
import { submitForm } from "@/client";
```

Internal test helpers (e.g. `__resetBindForTests` from `bind.ts`) continue to import from `@/bind`. Tests do not need to go through the published package entry.

## Migration steps

1. Move `packages/js/src/*.test.ts` → `packages/js/tests/*.test.ts`
2. Rewrite imports to `@/...`
3. Update `packages/js` Vitest + tsconfig
4. Scaffold `tests/.gitkeep` + Vitest config + tsconfig paths for React and Vue
5. Document convention in `AGENTS.md`
6. Verify: `pnpm -r test`, `pnpm -r typecheck`, `pnpm -r build`

## Success criteria

- No `*.test.ts` under any `packages/*/src/`
- Existing JS unit tests pass from `packages/js/tests/`
- `pnpm -r test` green (React/Vue pass with no tests)
- `pnpm -r typecheck` and `pnpm -r build` green
- `@/` resolves in Vitest consistently across packages
- `AGENTS.md` documents the tests folder + alias convention

## Risks

- Vitest alias and TypeScript `paths` must stay in sync or IDE and runner will disagree.
- Empty `tests/` directories need `.gitkeep` to be tracked by git.
- tsup entry points remain under `src/`; moving tests does not affect published `dist/`.
