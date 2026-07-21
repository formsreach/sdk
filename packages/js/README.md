# `@formsreach/js`

Plain JavaScript / CDN SDK for [FormsReach](https://formsreach.com) — form backend for static sites and vanilla JS apps.

[![npm](https://img.shields.io/npm/v/@formsreach/js.svg)](https://www.npmjs.com/package/@formsreach/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

For AI coding agents, see [AGENTS.md](./AGENTS.md) (API surface, do/don't, backend contract).

## Install

```bash
npm install @formsreach/js
# or: yarn add @formsreach/js / pnpm add @formsreach/js
```

## CDN

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

Forms with `data-formsreach` are intercepted after `FormsReach.init`.

## Programmatic submit

For frameworks or custom UI:

```ts
import { submitForm } from "@formsreach/js";

const { id, redirectUrl } = await submitForm({
  apiKey: "fr_your_key",
  data: { name: "Ada", email: "ada@example.com" },
});
```

## Events

After `init`, the SDK dispatches DOM events on `document`:

- `formsreach:success` — `detail: { id, redirectUrl }`
- `formsreach:error` — `detail: { status, code, title, detail?, requestId? }`

## Examples

- [HTML / plain JS](../../examples/html) — runnable static example
- Monorepo overview: [root README](../../README.md)

## Related packages

| Package                         | When to use                       |
| ------------------------------- | --------------------------------- |
| [`@formsreach/react`](../react) | React / Next.js — `useFormsReach` |
| [`@formsreach/vue`](../vue)     | Vue / Nuxt — `useFormsReach`      |

## Build

```bash
pnpm --filter @formsreach/js build
# dist/index.js, dist/index.d.ts, dist/formsreach.min.js
```

## License

MIT
