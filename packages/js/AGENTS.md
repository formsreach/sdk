# @formsreach/js — agent guide

Plain JavaScript / CDN client for [FormsReach](https://formsreach.com). Zero runtime dependencies.

Use this package when the host app is HTML, vanilla JS, or you need a programmatic submit helper that React/Vue wrap.

## Install

```bash
npm install @formsreach/js
# or yarn / pnpm
```

CDN (do **not** change the path, global name, or form attribute):

```
https://unpkg.com/@formsreach/js/dist/formsreach.min.js
```

- Global: `FormsReach`
- Auto-bind attribute: `data-formsreach`
- CDN file name: `formsreach.min.js`

## Quick patterns

### 1. CDN + auto-bind (dashboard default)

```html
<script src="https://unpkg.com/@formsreach/js/dist/formsreach.min.js"></script>
<script>
  FormsReach.init({ apiKey: "fr_…" });
</script>
<form data-formsreach>
  <input name="name" required />
  <input name="email" type="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>
```

### 2. ESM init

```ts
import { FormsReach, init, submitForm } from "@formsreach/js";

FormsReach.init({
  apiKey: "fr_…",
  // endpoint?: string — default https://formsreach.com/api/v1/submit
  onSuccess: ({ id, redirectUrl }) => {},
  onError: (err) => {},
});
// equivalent: init({ apiKey: 'fr_…' })
```

Forms with `data-formsreach` are intercepted on submit after `init`.

### 3. Programmatic submit (frameworks / custom UI)

```ts
import { submitForm, FormsReachClientError } from "@formsreach/js";

try {
  const { id, redirectUrl } = await submitForm({
    apiKey: "fr_…",
    data: { name: "Ada", email: "ada@example.com" },
    // endpoint?: string
  });
} catch (e) {
  if (e instanceof FormsReachClientError) {
    // e.formsreach: { status, code, title, detail?, requestId? }
  }
  throw e;
}
```

Field values must be strings (`Record<string, string>`). File uploads are **not** supported.

## Public API

| Export                          | Kind     | Notes                                                                             |
| ------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `init(options)`                 | function | Requires non-empty `apiKey`. Binds `data-formsreach` forms.                       |
| `submitForm(options)`           | function | POST JSON body with `api_key` + fields; adds empty `_gotcha` honeypot if missing. |
| `FormsReach`                    | object   | `{ init, submitForm }` — also default export.                                     |
| `FormsReachClientError`         | class    | `error.formsreach` holds normalized error payload.                                |
| `DEFAULT_ENDPOINT`              | const    | `https://formsreach.com/api/v1/submit`                                            |
| `FORM_ATTR`                     | const    | `data-formsreach`                                                                 |
| `EVENT_SUCCESS` / `EVENT_ERROR` | const    | DOM event names (see below)                                                       |

### `FormsReachInitOptions`

- `apiKey: string` (required)
- `endpoint?: string`
- `onSuccess?: (result: { id: string; redirectUrl: string \| null }) => void`
- `onError?: (error: FormsReachError) => void`

### `SubmitFormOptions`

- `apiKey: string`
- `endpoint?: string`
- `data: Record<string, string>`

## Backend contract (do not invent alternatives)

- `POST` to endpoint (default above)
- Body JSON: form fields + `api_key` + optional `_gotcha` (non-empty → silent bot success server-side)
- Success envelope: `{ status: "success", data: { ok: true, id, redirectUrl }, meta: { requestId } }`
- Failure envelope: `{ status: "failure", data: null, error: Problem, meta }`
- Domain allowlist + CORS are enforced by FormsReach servers

## DOM events (after init)

- `formsreach:success` — `event.detail`: `{ id, redirectUrl }`
- `formsreach:error` — `event.detail`: `{ status, code, title, detail?, requestId? }`

## Do / don't

**Do**

- Use the api key from the FormsReach dashboard (`fr_…`)
- Prefer `data-formsreach` + `init` for plain HTML
- Use `submitForm` when building React/Vue wrappers or custom submit flows
- Surface `FormsReachClientError.formsreach` to users/logs

**Don't**

- Rename CDN file, `FormsReach` global, or `data-formsreach` without a major version + product snippet update
- Ship or document file-upload fields until the product API supports them
- Point at a non-FormsReach submit API unless the user explicitly overrides `endpoint` for self-host/testing
- Put dashboard or server code in the client

## Related packages

| Package             | When to use                       |
| ------------------- | --------------------------------- |
| `@formsreach/react` | React / Next.js — `useFormsReach` |
| `@formsreach/vue`   | Vue / Nuxt — `useFormsReach`      |

## Human docs

See `README.md` in this package for install snippets and build notes.
