# @formsreach/react — agent guide

React / Next.js hook for [FormsReach](https://formsreach.com). Depends on `@formsreach/js` for the network layer.

Use this package for React apps and Next.js (App Router: mark the form component with `'use client'`).

## Install

```bash
npm install @formsreach/react
# pulls @formsreach/js as a dependency
```

Peer: `react` >= 18.

## Quick pattern

```tsx
"use client"; // required in Next.js App Router client components

import { useFormsReach } from "@formsreach/react";

export function ContactForm() {
  const { submit, submitting } = useFormsReach("fr_…");

  return (
    <form onSubmit={submit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit" disabled={submitting}>
        Submit
      </button>
    </form>
  );
}
```

Optional options object (same api key string form also works):

```tsx
const { submit, submitting } = useFormsReach({
  apiKey: "fr_…",
  onSuccess: ({ id, redirectUrl }) => {},
  onError: (err) => {},
});
```

## Public API

### `useFormsReach(apiKeyOrOptions)`

**Argument:** `string` (api key) **or** `UseFormsReachOptions`:

| Field       | Type                                  | Notes                                  |
| ----------- | ------------------------------------- | -------------------------------------- |
| `apiKey`    | `string`                              | Required when using the options object |
| `onSuccess` | `(result: FormsReachSuccess) => void` | Optional                               |
| `onError`   | `(error: FormsReachError) => void`    | Optional                               |

The submit URL is fixed inside `@formsreach/js` and cannot be overridden.

**Returns:**

| Field        | Type                                          | Notes                                                                                                           |
| ------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `submit`     | `(event: FormEvent<HTMLFormElement>) => void` | Attach to `<form onSubmit={submit}>`. Calls `preventDefault`, serializes string fields, POSTs via `submitForm`. |
| `submitting` | `boolean`                                     | True while a request is in flight; double-submit is ignored.                                                    |

On success, if `redirectUrl` is non-null, the hook assigns `window.location` to it after `onSuccess`.

## Form requirements

- Use a native `<form>` and named controls (`name="…"`)
- Values are collected as strings only (no file inputs)
- Spam protection is automatic: the hook injects empty `_gotcha` + mount-time `_ts` on submit via `ensureSpamFields`. Optional explicit fields in markup are preserved if present.

## Errors

Network / API failures call `onError` with a `FormsReachError`-shaped object:

```ts
{ status: number; code: string; title: string; detail?: string; requestId?: string }
```

They do **not** rethrow to the form handler. Surface UI from `onError` or local state you set there.

## Do / don't

**Do**

- Match the dashboard snippet: `useFormsReach('fr_…')` + `onSubmit={submit}`
- Add `'use client'` for Next.js App Router components that use the hook
- Disable the submit button with `submitting`

**Don't**

- Call `FormsReach.init` / `data-formsreach` from the React package path — use the hook instead
- Pass non-string FormData values / file fields
- Invent a different hook name or return shape (product snippets freeze `submit` + `submitting`)

## Related

- Low-level API / CDN: `@formsreach/js` (see that package’s `AGENTS.md`)
- Vue: `@formsreach/vue`

## Human docs

See `README.md` in this package.
