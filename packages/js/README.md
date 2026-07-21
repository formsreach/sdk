# `@formsreach/js`

Plain JavaScript / CDN SDK for [FormsReach](https://formsreach.com).

For AI coding agents, see [AGENTS.md](./AGENTS.md) (API surface, do/don't, backend contract).

## CDN

```html
<script src="https://unpkg.com/@formsreach/js/dist/formreach.min.js"></script>
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

## npm

```bash
npm install @formsreach/js
```

```ts
import { FormsReach, submitForm } from "@formsreach/js";

FormsReach.init({
  apiKey: "fr_your_key",
  // endpoint: 'https://formsreach.com/api/v1/submit',
  onSuccess: ({ id, redirectUrl }) => {
    /* … */
  },
  onError: (err) => {
    /* … */
  },
});
```

### Programmatic submit (for frameworks)

```ts
import { submitForm } from "@formsreach/js";

const { id, redirectUrl } = await submitForm({
  apiKey: "fr_your_key",
  data: { name: "Ada", email: "ada@example.com" },
});
```

## Events

- `formsreach:success` — `detail: { id, redirectUrl }`
- `formsreach:error` — `detail: { status, code, title, detail?, requestId? }`

## Build

```bash
pnpm --filter @formsreach/js build
# dist/index.js, dist/index.d.ts, dist/formreach.min.js
```
