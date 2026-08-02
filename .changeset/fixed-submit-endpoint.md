---
"@formsreach/js": minor
"@formsreach/react": minor
"@formsreach/vue": minor
---

Bake the submit endpoint into the SDK and stop exposing it

All requests now go to `https://app.formsreach.com/api/v1/submit`, which is fixed inside `@formsreach/js`.

**Breaking:**

- Removed the `endpoint` option from `FormsReach.init`, `submitForm`, and `useFormsReach` (React and Vue).
- Removed the `DEFAULT_ENDPOINT` export from `@formsreach/js`.
