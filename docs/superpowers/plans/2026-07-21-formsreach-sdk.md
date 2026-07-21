# FormsReach SDK Implementation Plan

**Date:** 2026-07-21  
**Repo:** `/Users/muthaiyan/dev/personal/formsreach-sdk`

## Phase 0 — Bootstrap (done when monorepo builds)

- [x] Root package.json, pnpm workspace, LICENSE, README
- [x] AGENTS.md / CLAUDE.md for Grok (local only — gitignored, not published)
- [x] Design + plan docs
- [x] packages/js, react, vue scaffold
- [x] examples (html runnable; others README stubs)
- [x] `pnpm install && pnpm build && pnpm test` green
- [x] `git init` + initial commit

## Phase 1 — Harden `@formsreach/js`

- [x] serialize, client, bind, init, events
- [x] unit tests (serialize, client, init)
- [x] IIFE global `FormsReach` smoke-verified (`init` + `submitForm`)
- [ ] Optional: demo server script in root README

## Phase 2 — Framework polish

- [x] React `useFormsReach`
- [x] Vue `useFormsReach`
- [ ] Framework package tests
- [ ] Full Vite examples (react, vue) and Next/Nuxt scaffolds

## Phase 3 — Publish

- [ ] npm org `@formsreach` access
- [ ] changesets or manual publish (unpkg serves the package after npm publish)
- [x] Document CDN as unpkg (no `cdn.formsreach.com`)
- [ ] CI workflow

## Phase 4 — Product alignment

- [ ] formsreach-app snippets already match; verify against live CDN
- [ ] Optional: playground uses real SDK build

## Grok bootstrap for this repo

1. `cd /Users/muthaiyan/dev/personal/formsreach-sdk && grok`
2. Keep a local `AGENTS.md` (gitignored) for project rules — not shipped in the public repo.
3. Optional experimental memory:
   ```toml
   # ~/.grok/config.toml
   [memory]
   enabled = true
   ```
   Then `/remember` key decisions and `/flush` after bootstrap sessions.
4. First prompt template:
   > Read local AGENTS.md (if present) and docs/superpowers/. Continue from the current plan phase.
