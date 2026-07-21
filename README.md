# FormsReach SDK

Official client libraries for [FormsReach](https://formsreach.com) — drop-in form backend for static sites and modern frameworks.

## Packages

| Package | Install | Use case |
|---|---|---|
| [`@formsreach/js`](./packages/js) | CDN or `npm i @formsreach/js` | Plain HTML / vanilla JS |
| [`@formsreach/react`](./packages/react) | `npm i @formsreach/react` | React & Next.js |
| [`@formsreach/vue`](./packages/vue) | `npm i @formsreach/vue` | Vue & Nuxt |

## Quick start (plain JS)

```html
<script src="https://unpkg.com/@formsreach/js/dist/formreach.min.js"></script>
<script>
  FormsReach.init({ apiKey: 'fr_your_key' });
</script>

<form data-formsreach>
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>
```

## Monorepo

```bash
pnpm install
pnpm -r build
pnpm -r test
```

## Examples

See [`examples/`](./examples) for HTML, React, Next.js, Vue, and Nuxt.

## License

MIT
