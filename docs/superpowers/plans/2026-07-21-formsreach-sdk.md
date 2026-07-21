# FormsReach SDK Implementation Plan

**Date:** 2026-07-21  
**Repo:** `/Users/muthaiyan/dev/personal/formsreach-sdk`

## Phase 0 — Bootstrap (done when monorepo builds)

- [x] Root package.json, pnpm workspace, LICENSE, README
- [x] AGENTS.md / CLAUDE.md for Grok
- [x] Design + plan docs
- [x] packages/js, react, vue scaffold
- [x] examples (html runnable; others README stubs)
- [ ] `pnpm install && pnpm build && pnpm test` green
- [ ] `git init` + initial commit

## Phase 1 — Harden `@formsreach/js`

- [x] serialize, client, bind, init, events
- [x] unit tests (serialize, client, init)
- [ ] Fix IIFE global export if needed after build smoke
- [ ] Optional: demo server script in root README

## Phase 2 — Framework polish

- [x] React `useFormsReach`
- [x] Vue `useFormsReach`
- [ ] Framework package tests
- [ ] Full Vite examples (react, vue) and Next/Nuxt scaffolds

## Phase 3 — Publish

- [ ] npm org `@formsreach` access
- [ ] changesets or manual publish
- [ ] Host `formreach.min.js` on CDN (or document unpkg/jsDelivr path)
- [ ] CI workflow

## Phase 4 — Product alignment

- [ ] formsreach-app snippets already match; verify against live CDN
- [ ] Optional: playground uses real SDK build

## Grok bootstrap for this repo

1. `cd /Users/muthaiyan/dev/personal/formsreach-sdk && grok`
2. AGENTS.md loads automatically (project rules).
3. Optional experimental memory:
   ```toml
   # ~/.grok/config.toml
   [memory]
   enabled = true
   ```
   Then `/remember` key decisions and `/flush` after bootstrap sessions.
4. First prompt template:
   > Read AGENTS.md and docs/superpowers/. Continue Phase 1 — green tests + dual build for @formsreach/js.
