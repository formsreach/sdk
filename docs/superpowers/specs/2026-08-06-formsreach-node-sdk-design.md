# @formsreach/node SDK Design

**Date:** 2026-08-06  
**Status:** Approved  
**Repo:** `formsreach-sdk`  
**API reference:** [OpenAPI](https://app.formsreach.com/api/openapi.json) · [docs UI](https://app.formsreach.com/api/docs)

## Summary

Server-side management SDK for Node.js that reads FormsReach forms and submissions using a **developer API key** (`Authorization: Bearer …`). Distinct from the browser submit packages (`@formsreach/js`, `@formsreach/react`, `@formsreach/vue`), which use the public form `api_key` (`fr_…`) against `POST /api/v1/submit`.

## Decisions

| Topic | Decision |
|---|---|
| Package | `@formsreach/node` in `packages/node` |
| Auth | Developer API key only (`Authorization: Bearer <key>`) |
| `/me` | Out of v1 — OpenAPI marks it session-cookie only |
| Scope | Read-only: forms list/get; submissions list/get/export/attachment URL |
| API shape | `new FormsReach({ apiKey })` with `forms` and `submissions` resources |
| Base URL | Fixed `https://app.formsreach.com` — no `baseUrl` / `endpoint` option |
| Implementation | Hand-rolled thin client; TypeScript strict; zero runtime deps; native `fetch` |
| Envelope | Unwrap success `data`; throw `FormsReachClientError` on failure |
| Docs | Package README (how-to) + `AGENTS.md` |
| Example | `examples/node` runnable demo |

## Architecture

```
Node app / script
  → @formsreach/node (FormsReach client)
    → GET https://app.formsreach.com/api/v1/...
      Authorization: Bearer <developer_api_key>
```

- Required developer-key scopes for v1 methods: `forms:read`, `submissions:read` (created in the FormsReach dashboard via API keys).
- Do not use the public form submit key (`fr_…`) with this package.
- Do not invent a published `@formsreach/core` for shared HTTP helpers until duplication forces it; copy the envelope/error pattern from `@formsreach/js` as needed.

## Public API

```ts
import { FormsReach, FormsReachClientError } from "@formsreach/node";

const fr = new FormsReach({ apiKey: process.env.FORMSREACH_API_KEY! });

const { items } = await fr.forms.list();
const form = await fr.forms.get(formId);

const page = await fr.submissions.list(formId, {
  limit: 50, // 1–100, default 50
  cursor: undefined,
  q: "search", // optional, max 200 chars
  spam: false, // default inbox; true = spam folder
});
const one = await fr.submissions.get(formId, submissionId);
const csv = await fr.submissions.export(formId); // CSV string from envelope data
const { url, expiresIn } = await fr.submissions.getAttachmentUrl(
  formId,
  submissionId,
  attachmentId,
);
```

**Exports:** `FormsReach` (also default), `FormsReachClientError`, and types (`Form`, `FormSummary`, `FormList`, `Submission`, `SubmissionList`, `AttachmentSignedUrl`, option types).

## Endpoints (v1)

| Method | Path | Client method |
|---|---|---|
| GET | `/api/v1/forms` | `forms.list()` → `{ items: FormSummary[] }` |
| GET | `/api/v1/forms/{formId}` | `forms.get(formId)` → `Form` |
| GET | `/api/v1/forms/{formId}/submissions` | `submissions.list(formId, opts?)` → `{ items, nextCursor }` |
| GET | `/api/v1/forms/{formId}/submissions/{submissionId}` | `submissions.get(formId, submissionId)` → `Submission` |
| GET | `/api/v1/forms/{formId}/submissions/export` | `submissions.export(formId)` → `string` (CSV body) |
| GET | `/api/v1/forms/{formId}/submissions/{submissionId}/attachments/{attachmentId}/url` | `submissions.getAttachmentUrl(...)` → `{ url, expiresIn }` |

Pagination for submissions is explicit via `cursor` / `nextCursor` (no async iterators in v1).

## Modules

| File | Role |
|---|---|
| `src/client.ts` | HTTP helper: Bearer header, fixed host, JSON parse, envelope unwrap |
| `src/resources/forms.ts` | `list`, `get` |
| `src/resources/submissions.ts` | `list`, `get`, `export`, `getAttachmentUrl` |
| `src/types.ts` | Hand-written types from OpenAPI schemas |
| `src/errors.ts` | `FormsReachClientError` |
| `src/index.ts` | Public surface |
| `tests/` | Vitest; mock `fetch`; mirror src module names; `@/` imports |

Build: tsup. Engines: Node ≥20. Workspace: pnpm; publish via changesets like other packages.

## Data flow & errors

1. Resource method builds path and query string.
2. Client `request()` sets `Authorization: Bearer …`, `Accept: application/json`, calls `fetch`.
3. Parse JSON. If `status === "success"`, return `data`. If `status === "failure"`, throw `FormsReachClientError` with Problem fields plus `meta.requestId`.
4. Network failure / non-JSON / unexpected shape → same error class with synthetic codes (`network_error`, `invalid_response`, `unexpected_response`), aligned with `@formsreach/js`.
5. Constructor rejects empty/missing `apiKey` immediately.
6. No automatic retries (callers handle 429).

`FormsReachClientError.formsreach` includes: `type?`, `title`, `status`, `code`, `detail?`, `errors?`, `requestId?`.

## Package README

`packages/node/README.md` documents:

- Install (`npm` / `pnpm` / `yarn`)
- Auth: `FORMSREACH_API_KEY`, scopes, contrast with public form `fr_…` key
- Quick start for every v1 method
- Error handling with `FormsReachClientError`
- Link to `examples/node` and `AGENTS.md`
- Build notes

Also ship `packages/node/AGENTS.md` (agent-oriented contract, same role as other packages). Update root `AGENTS.md` package table to include `@formsreach/node`.

## Example (`examples/node`)

Private workspace package `@formsreach/example-node`:

- Depends on workspace `@formsreach/node`
- Reads `FORMSREACH_API_KEY` from the environment (never commit secrets)
- Optional `FORM_ID`; otherwise uses the first form from `forms.list()`
- Script: list forms → list submissions for that form → print a short summary (and CSV length from `export` when useful)
- `package.json` scripts via `tsx` or Node TypeScript strip on `index.ts`
- `examples/node/README.md`: setup, env vars, expected output, link to package docs
- Covered by existing `examples/*` in `pnpm-workspace.yaml`

## Testing

Vitest with mocked `fetch`:

- Bearer header and fixed URL construction
- Envelope unwrap success / failure throw
- `forms.list` / `forms.get`
- `submissions.list` query params (`limit`, `cursor`, `q`, `spam`)
- `export` returns string; `getAttachmentUrl` path
- Network / invalid JSON / empty apiKey constructor

## Out of scope (v1)

- Current user (`GET/PATCH/DELETE /api/v1/me`) — session only today
- Form/submission write or delete APIs
- Channels, rules, analytics, billing, usage, API-key management
- Public `POST /api/v1/submit` (belongs to `@formsreach/js`)
- Configurable `baseUrl` / `endpoint`
- Session cookie auth / login helpers
- Async page iterators
- OpenAPI codegen

## Follow-ups

- Add `/me` when the product API accepts Bearer for it
- Write APIs (forms CRUD, submission spam/delete) behind the same client
- Optional `for await` pagination helpers when callers need them
