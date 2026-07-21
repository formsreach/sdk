# FormsReach SDK Design

**Date:** 2026-07-21  
**Status:** Approved  
**Repo:** `formsreach-sdk` (standalone open source)

## Summary

Client SDKs that submit browser forms to FormsReach `POST /api/v1/submit`. Three packages:

1. `@formsreach/js` — CDN script + ESM (`FormsReach.init`, `data-formsreach`)
2. `@formsreach/react` — `useFormsReach` for React/Next
3. `@formsreach/vue` — `useFormsReach` for Vue/Nuxt

## Decisions

| Topic | Decision |
|---|---|
| Layout | pnpm monorepo: `packages/*`, `examples/*` |
| Success UX | Follow `redirectUrl` if set; else stay + callback/event |
| Error UX | Callback + event; re-enable controls; no alert |
| Plain JS discovery | Document-level submit delegation |
| Shared logic | `submitForm` exported from `@formsreach/js`; frameworks depend on it |
| CDN | unpkg: `https://unpkg.com/@formsreach/js/dist/formreach.min.js` (`formreach.min.js`, global `FormsReach`) |
| Default endpoint | `https://formsreach.com/api/v1/submit` |

## Backend contract

- Envelope success: `{ data: { ok, id, redirectUrl }, status: "success", meta }`
- Envelope failure: `{ data: null, status: "failure", error: Problem, meta }`
- `api_key` required; `_gotcha` honeypot
- String fields only; CORS + domain allowlist server-side

## Plain JS runtime

1. `init({ apiKey, endpoint?, onSuccess?, onError? })`
2. Capture-phase `document` submit listener for `form[data-formsreach]`
3. Serialize FormData → JSON POST with `api_key` + `_gotcha`
4. Disable submit buttons while in flight (`aria-busy`)
5. Success / error callbacks + CustomEvents on the form

## Framework APIs

```ts
const { submit, submitting } = useFormsReach(apiKey);
// React: <form onSubmit={submit}>
// Vue:   <form @submit.prevent="submit">
```

## Out of scope (v1)

- File uploads
- Multi-key / multi-instance registry
- Built-in success/error UI
- Product app server code
