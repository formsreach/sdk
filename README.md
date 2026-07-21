# FormsReach SDK

[![npm @formsreach/js](https://img.shields.io/npm/v/@formsreach/js.svg)](https://www.npmjs.com/package/@formsreach/js)
[![npm @formsreach/react](https://img.shields.io/npm/v/@formsreach/react.svg)](https://www.npmjs.com/package/@formsreach/react)
[![npm @formsreach/vue](https://img.shields.io/npm/v/@formsreach/vue.svg)](https://www.npmjs.com/package/@formsreach/vue)
[![CI](https://github.com/formsreach/sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/formsreach/sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Official client libraries for [FormsReach](https://formsreach.com) — a form backend and form API for static sites and modern frameworks. Submit HTML, React, or Vue forms without running your own server.

## Features

- **CDN drop-in** — one script tag + `data-formsreach` on any form
- **Plain JS / ESM** — `@formsreach/js` for vanilla apps and custom UIs
- **React & Next.js** — `useFormsReach` hook
- **Vue & Nuxt** — `useFormsReach` composable
- **TypeScript** — published types for all packages
- **Zero runtime deps** on the core JS SDK

## Packages

| Package                                 | Install                       | Use case                |
| --------------------------------------- | ----------------------------- | ----------------------- |
| [`@formsreach/js`](./packages/js)       | CDN or `npm i @formsreach/js` | Plain HTML / vanilla JS |
| [`@formsreach/react`](./packages/react) | `npm i @formsreach/react`     | React & Next.js         |
| [`@formsreach/vue`](./packages/vue)     | `npm i @formsreach/vue`       | Vue & Nuxt              |

## Quick start

### HTML / CDN

```html
<script src="https://unpkg.com/@formsreach/js/dist/formsreach.min.js"></script>
<script>
  FormsReach.init({ apiKey: "fr_your_key" });
</script>

<form data-formsreach>
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>
```

Get an API key from the [FormsReach dashboard](https://formsreach.com). See [`packages/js`](./packages/js) for programmatic `submitForm` usage.

### React / Next.js

```bash
npm install @formsreach/react
```

```tsx
import { useFormsReach } from "@formsreach/react";

const { submit, submitting } = useFormsReach("fr_your_key");
// <form onSubmit={submit}>…</form>
```

Full guide: [`packages/react`](./packages/react).

### Vue / Nuxt

```bash
npm install @formsreach/vue
```

```vue
<script setup>
import { useFormsReach } from "@formsreach/vue";
const { submit, submitting } = useFormsReach("fr_your_key");
</script>
```

Full guide: [`packages/vue`](./packages/vue).

## Examples

| Stack           | Path                                   |
| --------------- | -------------------------------------- |
| HTML / plain JS | [`examples/html`](./examples/html)     |
| React           | [`examples/react`](./examples/react)   |
| Next.js         | [`examples/nextjs`](./examples/nextjs) |
| Vue             | [`examples/vue`](./examples/vue)       |
| Nuxt            | [`examples/nuxt`](./examples/nuxt)     |

## Monorepo

```bash
pnpm install
pnpm -r build
pnpm -r test
pnpm lint
pnpm format
pnpm check   # format:check + lint + typecheck + test + build (also runs on pre-push)
```

## Contributing

- Use the GitHub issue templates for bugs and feature requests.
- Open a PR against `main`. The PR template includes a short checklist.
- For changes that affect published packages (`@formsreach/js`, `@formsreach/react`, `@formsreach/vue`), run `pnpm changeset`, choose a bump type, and commit the new file under `.changeset/`.
- Packages version in **lockstep** (same version across all three).
- See [Changesets](https://github.com/changesets/changesets) for details.

Git hooks (Husky): Conventional Commits on `commit-msg`; lint-staged on `pre-commit`; full `pnpm check` on `pre-push`.

## Releasing

The **Version Packages** PR is opened automatically by GitHub Actions when changesets land on `main`.

1. Merge PRs that include changesets into `main`.
2. The **Release** workflow opens or updates a **Version Packages** PR (bumps all packages together, updates each package `CHANGELOG.md`).
3. Review and merge the Version Packages PR.
4. The same workflow publishes to npm (`pnpm release` → build + `changeset publish`).

**Maintainer setup (one-time):** add a GitHub Actions secret `NPM_TOKEN` with publish access to the `@formsreach` npm scope. First public ship should use a real changeset (e.g. "Initial public release") via a Version PR — not a tooling-only dummy bump.

## License

MIT
