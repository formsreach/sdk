# @formsreach/vue — agent guide

Vue / Nuxt composable for [FormsReach](https://formsreach.com). Depends on `@formsreach/js` for the network layer.

Use this package for Vue 3 and Nuxt apps.

## Install

```bash
npm install @formsreach/vue
# pulls @formsreach/js as a dependency
```

Peer: `vue` >= 3.

## Quick pattern

```vue
<script setup>
import { useFormsReach } from "@formsreach/vue";

const { submit, submitting } = useFormsReach("fr_…");
</script>

<template>
  <form @submit.prevent="submit">
    <input name="name" required />
    <input name="email" type="email" required />
    <textarea name="message" required />
    <button type="submit" :disabled="submitting">Submit</button>
  </form>
</template>
```

Optional options object:

```ts
const { submit, submitting } = useFormsReach({
  apiKey: "fr_…",
  // endpoint?: string
  onSuccess: ({ id, redirectUrl }) => {},
  onError: (err) => {},
});
```

## Public API

### `useFormsReach(apiKeyOrOptions)`

**Argument:** `string` (api key) **or** `UseFormsReachOptions`:

| Field       | Type                                  | Notes                                    |
| ----------- | ------------------------------------- | ---------------------------------------- |
| `apiKey`    | `string`                              | Required when using the options object   |
| `endpoint`  | `string?`                             | Defaults to FormsReach public submit URL |
| `onSuccess` | `(result: FormsReachSuccess) => void` | Optional                                 |
| `onError`   | `(error: FormsReachError) => void`    | Optional                                 |

**Returns:**

| Field        | Type                     | Notes                                                                                                    |
| ------------ | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `submit`     | `(event: Event) => void` | Use with `@submit.prevent="submit"`. Prevents default, serializes string fields, POSTs via `submitForm`. |
| `submitting` | `Ref<boolean>`           | True while a request is in flight; double-submit is ignored. In templates, auto-unwraps.                 |

On success, if `redirectUrl` is non-null, the composable assigns `window.location` to it after `onSuccess`.

## Form requirements

- Use a native `<form>` and named controls (`name="…"`)
- Values are collected as strings only (no file inputs)
- Spam protection is automatic: the composable injects empty `_gotcha` + mount-time `_ts` on submit via `ensureSpamFields`. Optional explicit fields in markup are preserved if present.

## Errors

Failures call `onError` with:

```ts
{ status: number; code: string; title: string; detail?: string; requestId?: string }
```

They do **not** throw into the template handler. Use `onError` (or state you set there) for UI.

## Do / don't

**Do**

- Match the dashboard snippet: `useFormsReach('fr_…')` + `@submit.prevent="submit"`
- Bind `:disabled="submitting"` on the submit control
- Prefer this composable over raw CDN `init` inside Vue SFCs

**Don't**

- Use `data-formsreach` + `FormsReach.init` in Vue components — use the composable
- Pass file inputs / non-string values
- Change the return shape (`submit` + `submitting`) — product snippets freeze it

## Related

- Low-level API / CDN: `@formsreach/js` (see that package’s `AGENTS.md`)
- React: `@formsreach/react`

## Human docs

See `README.md` in this package.
