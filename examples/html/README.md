# HTML example

Plain HTML form backend with [FormsReach](https://formsreach.com). No JavaScript required for the basic POST path.

## No-JS form (native POST)

Point the form at the public submit endpoint and include your API key as a hidden field:

```html
<form action="https://api.formsreach.com/submit" method="POST">
  <input type="hidden" name="api_key" value="YOUR_API_KEY" />

  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>

  <button type="submit">Submit Form</button>
</form>
```

Replace `YOUR_API_KEY` with the key from the FormsReach dashboard (`fr_…`).

## Related

- Package docs: [`@formsreach/js`](../../packages/js)
- Root SDK overview: [README](../../README.md)
