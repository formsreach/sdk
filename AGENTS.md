# FormsReach SDK

Open-source client SDKs for the FormsReach form backend.

## Packages

| Package | Role |
|---|---|
| `@formsreach/js` | Plain JS + CDN (`FormsReach` global, `data-formsreach`) |
| `@formsreach/react` | `useFormsReach` for React / Next.js |
| `@formsreach/vue` | `useFormsReach` for Vue / Nuxt |

## Product API (backend lives in formsreach-app)

- Submit: `POST https://formsreach.com/api/v1/submit`
- Unified envelope:
  - success: `{ data, status: "success", meta: { requestId } }`
  - failure: `{ data: null, status: "failure", error: Problem, meta }`
- Body must include `api_key`; optional honeypot field `_gotcha` (non-empty → silent success)
- Domain allowlist + CORS enforced server-side
- Success `data`: `{ ok: true, id, redirectUrl }`

## Public API freeze (match product dashboard snippets)

**Plain JS / CDN**

```html
<script src="https://unpkg.com/@formsreach/js/dist/formreach.min.js"></script>
<script>
  FormsReach.init({ apiKey: 'fr_…' });
</script>
<form data-formsreach>…</form>
```

**React / Next**

```ts
import { useFormsReach } from '@formsreach/react';
const { submit, submitting } = useFormsReach('fr_…');
// <form onSubmit={submit}>
```

**Vue / Nuxt**

```ts
import { useFormsReach } from '@formsreach/vue';
const { submit, submitting } = useFormsReach('fr_…');
// <form @submit.prevent="submit">
```

CDN is **unpkg** (`https://unpkg.com/@formsreach/js/dist/formreach.min.js`), not a custom domain.
Do **not** rename the CDN file (`formreach.min.js`), the global (`FormsReach`), or the `data-formsreach` attribute without a major version + product snippet update.

## Conventions

- TypeScript strict; zero runtime dependencies in `@formsreach/js`
- tsup for package builds; Vitest for tests
- pnpm workspaces
- Export programmatic `submitForm` from `@formsreach/js` for React/Vue (advanced; not in the HTML snippet)
- Examples must run with a real or mocked endpoint
- Design/plan: `docs/superpowers/`

## Do not

- Put product dashboard or API server code in this repo
- Ship file-upload support until the product API supports binary fields
- Invent a separate published `@formsreach/core` until duplication forces it

## Build commands

```bash
pnpm install
pnpm -r build
pnpm -r test
pnpm -r typecheck
```

## Implementation order

1. `@formsreach/js` + `examples/html` (ship first)
2. Export `submitForm` for frameworks
3. `@formsreach/react` + examples
4. `@formsreach/vue` + examples
5. npm publish + CDN hosting

See `docs/superpowers/plans/2026-07-21-formsreach-sdk.md`.
