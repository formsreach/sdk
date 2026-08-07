# `@formsreach/node`

Node.js management SDK for [FormsReach](https://formsreach.com) — list and read forms and submissions with a **developer API key**.

[![npm](https://img.shields.io/npm/v/@formsreach/node.svg)](https://www.npmjs.com/package/@formsreach/node)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

This is **not** the browser submit SDK. For HTML / React / Vue form submission, use [`@formsreach/js`](../js), [`@formsreach/react`](../react), or [`@formsreach/vue`](../vue) with the public form key (`fr_…`).

For AI coding agents, see [AGENTS.md](./AGENTS.md).

## Install

```bash
npm install @formsreach/node
# or: yarn add @formsreach/node / pnpm add @formsreach/node
```

Requires Node.js ≥ 20.

## Auth

Use a **developer API key** from the FormsReach dashboard (API keys), not the public form submit key.

- Send as `Authorization: Bearer <key>`
- v1 methods need scopes: `forms:read`, `submissions:read`
- Prefer an env var such as `FORMSREACH_API_KEY`

| Key type                   | Package                        | Use                               |
| -------------------------- | ------------------------------ | --------------------------------- |
| Developer API key (Bearer) | `@formsreach/node`             | Manage / read forms & submissions |
| Public form key (`fr_…`)   | `@formsreach/js` / react / vue | Public form submit                |

## Quick start

```ts
import { FormsReach, FormsReachClientError } from "@formsreach/node";

const fr = new FormsReach({
  apiKey: process.env.FORMSREACH_API_KEY!,
});

const { items: forms } = await fr.forms.list();
const form = await fr.forms.get(forms[0]!.id);

const page = await fr.submissions.list(form.id, {
  limit: 50,
  cursor: undefined,
  q: "ada@",
  spam: false,
});
const one = await fr.submissions.get(form.id, page.items[0]!.id);
const csv = await fr.submissions.export(form.id);

const { url, expiresIn } = await fr.submissions.getAttachmentUrl(
  form.id,
  one.id,
  "attachment-uuid",
);
```

All requests go to `https://app.formsreach.com`. The host is built into the SDK and is not configurable.

## Errors

API and network failures throw `FormsReachClientError`:

```ts
try {
  await fr.forms.list();
} catch (e) {
  if (e instanceof FormsReachClientError) {
    // e.formsreach: { status, code, title, detail?, requestId?, type?, errors? }
  }
  throw e;
}
```

## Examples

- [Node management example](../../examples/node) — list forms and submissions with an env key

## Related packages

| Package                         | When to use            |
| ------------------------------- | ---------------------- |
| [`@formsreach/js`](../js)       | Browser / CDN submit   |
| [`@formsreach/react`](../react) | React / Next.js submit |
| [`@formsreach/vue`](../vue)     | Vue / Nuxt submit      |

## Build

```bash
pnpm --filter @formsreach/node build
# dist/index.js, dist/index.d.ts
```

## License

MIT
