# Lint, Format, and Git Quality Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add root-owned ESLint 9, Prettier, Husky, Commitlint, and lint-staged so commits are cleaned, commit messages are conventional, and pushes only succeed after format + lint + typecheck + test + build.

**Architecture:** All tooling lives at the monorepo root as `devDependencies`. ESLint flat config and Prettier cover `packages/**` only. Husky wires `commit-msg` → commitlint, `pre-commit` → lint-staged, `pre-push` → `pnpm check`. CI runs the same format/lint steps before existing build/test/typecheck.

**Tech Stack:** pnpm workspaces, ESLint 9 flat config, typescript-eslint, eslint-config-prettier, eslint-plugin-react-hooks, Prettier, Husky 9, lint-staged, @commitlint/cli + config-conventional, GitHub Actions.

## Global Constraints

- Tooling ownership: **root package only** (no per-package eslint deps)
- Lint/format path scope: **`packages/**` only** (not `examples/*`)
- Prettier: **defaults** (no custom style bikeshedding)
- ESLint: **non-type-aware** recommended rules in v1
- Commit messages: **Conventional Commits** via `@commitlint/config-conventional`
- pre-push gate order: **format:check → lint → typecheck → test → build**
- No new runtime deps in published packages
- Spec: `docs/superpowers/specs/2026-07-21-lint-format-hooks-design.md`

## File map

| File | Responsibility |
|---|---|
| `package.json` | Root scripts, lint-staged config, devDependencies |
| `eslint.config.js` | Flat ESLint rules for packages + react-hooks |
| `.prettierrc` | Prettier defaults (empty object or omit options) |
| `.prettierignore` | Ignore dist, lockfile, coverage, etc. |
| `commitlint.config.js` | Extends conventional |
| `.husky/commit-msg` | Run commitlint |
| `.husky/pre-commit` | Run lint-staged |
| `.husky/pre-push` | Run `pnpm check` |
| `.github/workflows/ci.yml` | Add format:check + lint |
| `packages/{js,react,vue}/package.json` | Remove stub lint scripts |
| `README.md` | Document contributor quality scripts |

---

### Task 1: Install root tooling and wire package.json scripts

**Files:**
- Modify: `package.json`
- Modify: `packages/js/package.json`
- Modify: `packages/react/package.json`
- Modify: `packages/vue/package.json`

**Interfaces:**
- Produces: root scripts `lint`, `format`, `format:check`, `check`, `prepare`; root `lint-staged` field; root devDependencies for all tools

- [ ] **Step 1: Add root devDependencies**

From repo root:

```bash
pnpm add -D -w \
  eslint@^9 \
  @eslint/js@^9 \
  typescript-eslint@^8 \
  eslint-config-prettier@^10 \
  eslint-plugin-react-hooks@^5 \
  prettier@^3 \
  husky@^9 \
  lint-staged@^15 \
  @commitlint/cli@^19 \
  @commitlint/config-conventional@^19 \
  globals@^15
```

Expected: `package.json` gains `devDependencies`; `pnpm-lock.yaml` updates.

- [ ] **Step 2: Replace root scripts and add lint-staged + prepare**

Set root `package.json` scripts to:

```json
{
  "scripts": {
    "prepare": "husky",
    "build": "pnpm -r --filter \"./packages/**\" build",
    "test": "pnpm -r --filter \"./packages/**\" test",
    "typecheck": "pnpm -r --filter \"./packages/**\" typecheck",
    "lint": "eslint \"packages/**/*.{ts,tsx}\" --max-warnings 0",
    "format": "prettier --write \"packages/**/*.{ts,tsx,json,md}\" \"*.md\" \".github/**/*.{yml,yaml}\"",
    "format:check": "prettier --check \"packages/**/*.{ts,tsx,json,md}\" \"*.md\" \".github/**/*.{yml,yaml}\"",
    "check": "pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  },
  "lint-staged": {
    "packages/**/*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "packages/**/*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

Keep existing `engines`, `packageManager`, `private`, `name`, `description`, `license`.

- [ ] **Step 3: Remove package-level lint stubs**

In each of `packages/js/package.json`, `packages/react/package.json`, `packages/vue/package.json`, delete the `"lint"` script line entirely (root owns lint).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml packages/js/package.json packages/react/package.json packages/vue/package.json
git commit -m "chore: add eslint, prettier, husky, commitlint dependencies"
```

---

### Task 2: ESLint and Prettier configs

**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `.prettierignore`

**Interfaces:**
- Consumes: packages from Task 1
- Produces: working `pnpm lint` and `pnpm format:check` (may fail until code is fixed)

- [ ] **Step 1: Create `eslint.config.js`**

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "examples/**",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["packages/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["packages/react/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  eslintConfigPrettier,
);
```

- [ ] **Step 2: Create `.prettierrc`**

```json
{}
```

(Empty object = Prettier defaults.)

- [ ] **Step 3: Create `.prettierignore`**

```
dist
node_modules
coverage
pnpm-lock.yaml
*.tsbuildinfo
.turbo
.next
.nuxt
.output
.vite
```

- [ ] **Step 4: Run format once to normalize the tree**

```bash
pnpm format
```

Expected: Prettier rewrites some package files if style differed from defaults.

- [ ] **Step 5: Run lint and fix issues**

```bash
pnpm lint
```

If errors, fix them in source (prefer real fixes over disabling rules). Re-run until exit 0.

For auto-fixable issues:

```bash
pnpm exec eslint "packages/**/*.{ts,tsx}" --fix --max-warnings 0
pnpm format
```

- [ ] **Step 6: Verify both pass**

```bash
pnpm format:check && pnpm lint
```

Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add eslint.config.js .prettierrc .prettierignore packages/
git commit -m "chore: add eslint and prettier configs and format packages"
```

---

### Task 3: Commitlint and Husky hooks

**Files:**
- Create: `commitlint.config.js`
- Create: `.husky/commit-msg`
- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`

**Interfaces:**
- Consumes: `prepare` script and `lint-staged` / `check` from Task 1
- Produces: hooks that block bad commits/pushes

- [ ] **Step 1: Create `commitlint.config.js`**

```js
export default {
  extends: ["@commitlint/config-conventional"],
};
```

- [ ] **Step 2: Initialize Husky**

```bash
pnpm exec husky
```

Expected: `.husky/` directory exists (may create sample hook; replace with ours).

- [ ] **Step 3: Create `.husky/commit-msg`**

```sh
#!/usr/bin/env sh
pnpm exec commitlint --edit "$1"
```

- [ ] **Step 4: Create `.husky/pre-commit`**

```sh
#!/usr/bin/env sh
pnpm exec lint-staged
```

- [ ] **Step 5: Create `.husky/pre-push`**

```sh
#!/usr/bin/env sh
pnpm run check
```

- [ ] **Step 6: Ensure hooks are executable**

```bash
chmod +x .husky/commit-msg .husky/pre-commit .husky/pre-push
```

- [ ] **Step 7: Verify commitlint rejects bad messages**

```bash
echo "bad message" | pnpm exec commitlint
```

Expected: non-zero exit, error about type.

```bash
echo "chore: valid message" | pnpm exec commitlint
```

Expected: exit 0.

- [ ] **Step 8: Re-run prepare so hooks are registered**

```bash
pnpm prepare
```

Expected: husky installs git hooks under `.git/hooks` (or husky shim).

- [ ] **Step 9: Commit**

```bash
git add commitlint.config.js .husky/
git commit -m "chore: add husky hooks and commitlint"
```

Note: this commit itself exercises `commit-msg` + `pre-commit`. If hooks fail, fix and retry.

---

### Task 4: CI alignment and docs

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: `format:check`, `lint`, `check` scripts
- Produces: CI that matches local full gate intent

- [ ] **Step 1: Update CI workflow**

Replace `.github/workflows/ci.yml` with:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm -r --filter "./packages/**" build
      - run: pnpm -r --filter "./packages/**" test
      - run: pnpm -r --filter "./packages/**" typecheck
```

- [ ] **Step 2: Document scripts in README**

After the existing Monorepo section bash block in `README.md`, ensure commands include quality scripts. Final Monorepo section should read:

```markdown
## Monorepo

```bash
pnpm install
pnpm -r build
pnpm -r test
pnpm lint
pnpm format
pnpm check   # format:check + lint + typecheck + test + build (also runs on pre-push)
```

Git hooks (Husky): Conventional Commits on `commit-msg`; lint-staged on `pre-commit`; full `pnpm check` on `pre-push`.
```

(Keep surrounding README content intact.)

- [ ] **Step 3: Run full local gate**

```bash
pnpm check
```

Expected: all steps pass (format:check, lint, typecheck, test, build).

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml README.md
git commit -m "ci: run format and lint in GitHub Actions"
```

---

### Task 5: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm root owns lint (packages have no lint script)**

```bash
node -e "for (const p of ['js','react','vue']) { const j=require('./packages/'+p+'/package.json'); if (j.scripts.lint) { console.error(p,'still has lint'); process.exit(1);} } console.log('ok')"
```

Expected: `ok`

- [ ] **Step 2: Confirm `pnpm check` green**

```bash
pnpm check
```

Expected: exit 0

- [ ] **Step 3: Confirm bad commit message fails (without creating a real commit)**

```bash
echo "not conventional" | pnpm exec commitlint
```

Expected: exit 1

- [ ] **Step 4: Confirm hooks exist and are executable**

```bash
test -x .husky/commit-msg && test -x .husky/pre-commit && test -x .husky/pre-push && echo hooks-ok
```

Expected: `hooks-ok`

- [ ] **Step 5: Optional dry-run of lint-staged**

```bash
pnpm exec lint-staged --diff HEAD
```

Expected: exit 0 (or no staged files message) without crashing.

- [ ] **Step 6: Final commit only if verification fixed anything; otherwise done**

If any verification failed, fix and commit:

```bash
git add -A
git commit -m "fix: address quality gate verification failures"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| ESLint 9 flat + typescript-eslint + prettier | Task 2 |
| eslint-plugin-react-hooks for react package | Task 2 |
| Prettier defaults, packages scope | Task 2 |
| Conventional Commits / commitlint | Task 3 |
| lint-staged pre-commit | Task 1 + 3 |
| Full pre-push gate | Task 1 (`check`) + 3 (`pre-push`) |
| Root-owned tooling | Task 1 |
| Remove package lint stubs | Task 1 |
| CI format:check + lint | Task 4 |
| README docs | Task 4 |
| Baseline green + verify | Task 2, 5 |

## Self-review notes

- No placeholders left in steps
- Script names consistent: `check`, `format:check`, `lint`
- Hook commands use `pnpm exec` / `pnpm run` for pnpm monorepo
- Published packages gain no runtime dependencies
