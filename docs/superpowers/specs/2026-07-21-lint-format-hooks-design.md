# Lint, format, and git quality gates

**Date:** 2026-07-21  
**Status:** Approved  
**Scope:** Monorepo root tooling for ESLint, Prettier, Husky, Commitlint; quality gates before push

## Problem

The FormsReach SDK monorepo has no shared formatter, linter, or local git hooks. Package `lint` scripts are stubs (`echo "no lint yet"`). CI runs build, test, and typecheck only. Contributors can push unformatted code, inconsistent style, or failing checks that only fail later in GitHub Actions—or not at all for format/lint.

## Goals

1. ESLint + Prettier for TypeScript in `packages/*`
2. Conventional Commits via Commitlint
3. Husky hooks: auto-fix staged files on commit; full quality gate before push
4. Align CI with the same checks so local and remote agree
5. Keep tooling root-owned (pnpm workspace-friendly)

## Non-goals

- Linting `examples/*` in this pass
- Biome or other ESLint/Prettier replacements
- Changing publish or release automation
- Strict import-order plugins (can add later)
- Enforcing hooks for contributors who use `--no-verify` (document, do not try to defeat)

## Decisions

| Topic | Decision |
|---|---|
| Tooling ownership | Root package only |
| ESLint | v9 flat config + typescript-eslint + eslint-config-prettier |
| React | eslint-plugin-react-hooks for `packages/react/**` globs |
| Vue | No Vue SFC plugin until packages contain `.vue` files |
| Format scope | Prettier on packages TS/JSON/MD (and root configs as useful) |
| Lint/format path scope | `packages/**` only for ESLint; Prettier can format shared root configs |
| Commit messages | Conventional Commits (`@commitlint/config-conventional`) |
| pre-commit | lint-staged: ESLint `--fix` + Prettier `--write` on staged files under packages |
| pre-push | Full gate: `format:check` + `lint` + `typecheck` + `test` + `build` |
| commit-msg | commitlint |
| CI | Add `format:check` and `lint` to existing workflow |

## Architecture

```
Root package.json
  devDependencies: eslint, typescript-eslint, prettier, husky,
                    lint-staged, @commitlint/cli, @commitlint/config-conventional, …
  scripts:
    prepare → husky
    lint → eslint packages
    format / format:check → prettier
    typecheck / test / build → existing recursive package scripts
    prepush / check → format:check && lint && typecheck && test && build

eslint.config.js          # flat config
.prettierrc / .prettierignore
commitlint.config.*
.lintstagedrc.* or package.json "lint-staged"
.husky/
  commit-msg
  pre-commit
  pre-push
.github/workflows/ci.yml  # + lint + format:check
```

### ESLint (flat)

- Target: `packages/*/src/**/*.{ts,tsx}`, `packages/*/tests/**/*.{ts,tsx}`, and package config `*.ts` as needed
- Ignore: `**/dist/**`, `**/node_modules/**`, lockfiles
- Base: `@eslint/js` recommended + `typescript-eslint` recommended
- `eslint-config-prettier` to disable formatting rules that fight Prettier
- `packages/react/**`: enable `eslint-plugin-react-hooks` recommended rules
- Do not type-aware lint in v1 (no `project: true`) unless it stays fast and simple—prefer non-type-aware recommended rules for DX

### Prettier

- Single root config using **Prettier defaults** (double quotes, semicolons as Prettier decides for TS). Avoid custom style bikeshedding in v1; first `format` run normalizes the tree.
- Ignore: `dist`, `node_modules`, `pnpm-lock.yaml`, coverage, generated files
- Scripts:
  - `format`: write under `packages/**` (and root config files if listed)
  - `format:check`: check (CI + pre-push)

### lint-staged (pre-commit)

On staged files matching packages globs:

- `*.{ts,tsx}` → `eslint --fix` then `prettier --write`
- `*.{json,md}` under packages → `prettier --write`

Only staged files are fixed/checked (fast commits).

### Husky

- `prepare`: `husky` so `pnpm install` installs hooks
- `commit-msg`: `pnpm exec commitlint --edit $1`
- `pre-commit`: `pnpm exec lint-staged`
- `pre-push`: `pnpm run check` (full gate)

### Full gate (`pnpm check` / pre-push)

Order (fail fast):

1. `format:check`
2. `lint`
3. `typecheck`
4. `test`
5. `build`

All must exit 0 before push proceeds.

### Package scripts

- Replace per-package `lint: echo "no lint yet"` with either removal (root-only lint) or `echo` replaced by a no-op that is unused—**prefer root `pnpm lint` only** so packages do not need local eslint deps
- Root `lint` script currently fans out with `pnpm -r … lint`; change root to run ESLint once at root instead of recursive stub

### CI alignment

Update `.github/workflows/ci.yml` after install:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm -r --filter "./packages/**" build` (existing)
4. `pnpm -r --filter "./packages/**" test` (existing)
5. `pnpm -r --filter "./packages/**" typecheck` (existing)

Optional: use `pnpm check` in CI for one command—acceptable if `check` matches the list above exactly.

## Implementation outline

1. Add root devDependencies and config files (eslint, prettier, commitlint, lint-staged)
2. Wire root scripts (`lint`, `format`, `format:check`, `check`, `prepare`)
3. Run format once and fix any ESLint issues so baseline is green
4. Add Husky hooks
5. Update CI workflow
6. Document in root README (and package AGENTS only if relevant—prefer monorepo README / local AGENTS note)
7. Verify: commit with bad message fails; good commit formats staged files; pre-push fails without green tests

## Success criteria

- [ ] `pnpm lint` and `pnpm format:check` pass on clean tree
- [ ] `pnpm check` passes (format + lint + typecheck + test + build)
- [ ] Invalid commit message is rejected by commitlint
- [ ] Staged TS under packages is eslint-fixed + prettier-written on commit
- [ ] `git push` blocked when any full-gate step fails
- [ ] CI runs format:check + lint in addition to build/test/typecheck
- [ ] No new runtime deps in published packages; tooling is root `devDependencies` only

## Risks

- **First format churn:** large pure-style diff on first Prettier run—run once in the implementation PR
- **Hook skip:** `--no-verify` bypasses local gates; CI remains the remote safety net
- **pre-push time:** full gate is slower; accepted by design for strongest local guarantee
- **pnpm + husky:** use `pnpm exec` in hooks; `prepare` must not break CI installs (husky no-ops when not a git checkout is fine; if needed `husky || true` only as last resort—prefer standard husky v9 install)

## Alternatives considered

| Approach | Why not chosen |
|---|---|
| Per-package ESLint configs | Duplication; packages share one language stack |
| Biome | User requested ESLint + Prettier specifically |
| pre-push tests only | Weaker; user chose full quality gate |
| Lint examples now | Examples mostly stubs; YAGNI |
