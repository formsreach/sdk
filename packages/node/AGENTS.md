# @formsreach/node — agent guide

Node.js management client for [FormsReach](https://formsreach.com). Zero runtime dependencies. Uses native `fetch` (Node ≥ 20).

Use this package on the **server** to read forms and submissions with a **developer API key**. Do not use it for public browser form submit — that is `@formsreach/js` / react / vue with the public form `fr_…` key.

## Install

```bash
npm install @formsreach/node
```

## Quick pattern

```ts
import { FormsReach, FormsReachClientError } from "@formsreach/node";

const fr = new FormsReach({ apiKey: process.env.FORMSREACH_API_KEY! });

const { items } = await fr.forms.list();
const form = await fr.forms.get(items[0]!.id);
const page = await fr.submissions.list(form.id, { limit: 50, spam: false });
const csv = await fr.submissions.export(form.id);
```

## Public API

| Export                                  | Kind   | Notes                                              |
| --------------------------------------- | ------ | -------------------------------------------------- |
| `FormsReach`                            | class  | `new FormsReach({ apiKey })` — also default export |
| `forms.list()`                          | method | `GET /api/v1/forms` → `{ items: FormSummary[] }`   |
| `forms.get(formId)`                     | method | `GET /api/v1/forms/{formId}` → `Form`              |
| `submissions.list(formId, opts?)`       | method | Query: `limit`, `cursor`, `q`, `spam`              |
| `submissions.get(formId, submissionId)` | method | Single submission                                  |
| `submissions.export(formId)`            | method | CSV string (envelope `data`)                       |
| `submissions.getAttachmentUrl(...)`     | method | `{ url, expiresIn }`                               |
| `FormsReachClientError`                 | class  | `error.formsreach` holds Problem + `requestId?`    |

### `FormsReachOptions`

- `apiKey: string` (required, non-empty after trim)

### `ListSubmissionsOptions`

- `limit?: number` (API default 50, max 100)
- `cursor?: string`
- `q?: string` (search, max 200)
- `spam?: boolean` (default inbox; `true` = spam folder)

## Backend contract (do not invent alternatives)

- Host: fixed `https://app.formsreach.com` (not configurable)
- Auth: `Authorization: Bearer <developer_api_key>`
- Required scopes for v1: `forms:read`, `submissions:read`
- Success envelope: `{ status: "success", data, meta: { requestId } }` — SDK returns `data`
- Failure envelope: `{ status: "failure", data: null, error: Problem, meta }` — SDK throws

## Do / don't

**Do**

- Use a dashboard **developer** API key with read scopes
- Surface `FormsReachClientError.formsreach` to logs/callers
- Pass pagination via `cursor` / `nextCursor` explicitly

**Don't**

- Pass the public form submit key (`fr_…`) as Bearer
- Add `baseUrl` / `endpoint` options
- Call `/api/v1/me` from this package in v1 (session cookie only on the API today)
- Implement write/delete APIs until a later version of this package

## Related packages

| Package             | When to use            |
| ------------------- | ---------------------- |
| `@formsreach/js`    | Browser / CDN submit   |
| `@formsreach/react` | React / Next.js submit |
| `@formsreach/vue`   | Vue / Nuxt submit      |

## Human docs

See `README.md` in this package.
