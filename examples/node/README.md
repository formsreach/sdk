# Node example

Runnable demo for [`@formsreach/node`](../../packages/node) — list forms and submissions with a developer API key.

## Prerequisites

- Node.js ≥ 20
- A FormsReach **developer API key** with scopes `forms:read` and `submissions:read` (not the public form `fr_…` key)

## Setup

From the monorepo root:

```bash
pnpm install
pnpm --filter @formsreach/node build
```

## Run

```bash
cd examples/node
FORMSREACH_API_KEY=your_developer_key pnpm start
```

Optional: target a specific form

```bash
FORMSREACH_API_KEY=… FORM_ID=your-form-uuid pnpm start
```

## Expected output

- Count and names of your forms
- Detail for the selected form (or first form)
- Up to 10 submissions plus `nextCursor` when present
- CSV export character length

## Related

- Package docs: [`@formsreach/node`](../../packages/node)
- Root overview: [README](../../README.md)
