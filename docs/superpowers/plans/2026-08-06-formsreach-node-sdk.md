# @formsreach/node Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@formsreach/node`, a read-only Node management SDK for FormsReach forms and submissions (Bearer developer API key), plus package docs and `examples/node`.

**Architecture:** Hand-rolled ESM client with a shared HTTP helper that unwraps the unified `{ data, status, meta }` envelope. `FormsReach` exposes `forms` and `submissions` resource objects. Base URL is fixed to `https://app.formsreach.com`. Zero runtime dependencies; Node ≥20 native `fetch`.

**Tech Stack:** TypeScript strict, tsup (ESM + dts), Vitest (node env), pnpm workspaces, mocked `fetch` in tests.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-06-formsreach-node-sdk-design.md`
- Auth: `Authorization: Bearer <developer_api_key>` only (not public form `fr_…` key)
- Base URL: fixed `https://app.formsreach.com` — no `baseUrl` / `endpoint` option
- v1 methods: `forms.list`, `forms.get`, `submissions.list`, `submissions.get`, `submissions.export`, `submissions.getAttachmentUrl` only
- Zero runtime dependencies; Node ≥20
- Tests in `packages/node/tests/`; import via `@/` → `./src/*`
- Do not implement `/me`, writes, or OpenAPI codegen
- Commit message body lines ≤100 chars (commitlint)

---

## File Structure

| Path | Responsibility |
|---|---|
| `packages/node/package.json` | Package metadata, scripts, exports |
| `packages/node/tsconfig.json` | Strict TS; `@/*` paths; no DOM lib |
| `packages/node/tsup.config.ts` | ESM + dts build of `src/index.ts` |
| `packages/node/vitest.config.ts` | Node env; `@` alias; `tests/**/*.test.ts` |
| `packages/node/src/types.ts` | OpenAPI-aligned types + `API_BASE` |
| `packages/node/src/errors.ts` | `FormsReachClientError` |
| `packages/node/src/http.ts` | Bearer `request()` + envelope unwrap |
| `packages/node/src/resources/forms.ts` | Forms resource |
| `packages/node/src/resources/submissions.ts` | Submissions resource |
| `packages/node/src/client.ts` | `FormsReach` class wiring resources |
| `packages/node/src/index.ts` | Public exports |
| `packages/node/tests/*.test.ts` | Unit tests |
| `packages/node/README.md` | Human how-to |
| `packages/node/AGENTS.md` | Agent contract |
| `examples/node/*` | Runnable example |
| `AGENTS.md`, `README.md` | Root package table / quick start |

---

### Task 1: Scaffold `@formsreach/node` package

**Files:**
- Create: `packages/node/package.json`
- Create: `packages/node/tsconfig.json`
- Create: `packages/node/tsup.config.ts`
- Create: `packages/node/vitest.config.ts`
- Create: `packages/node/src/index.ts` (placeholder export for install)

**Interfaces:**
- Produces: workspace package `@formsreach/node` that builds/tests with empty/minimal entry

- [ ] **Step 1: Create `packages/node/package.json`**

```json
{
  "name": "@formsreach/node",
  "version": "0.1.0",
  "description": "FormsReach Node.js management SDK (forms & submissions)",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "AGENTS.md", "README.md"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "engines": {
    "node": ">=20"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  },
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/formsreach/sdk.git",
    "directory": "packages/node"
  },
  "keywords": ["formsreach", "forms", "node", "sdk"]
}
```

- [ ] **Step 2: Create `packages/node/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "rootDir": "src",
    "outDir": "dist",
    "types": ["node"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 3: Create `packages/node/tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "node20",
  treeshake: true,
});
```

- [ ] **Step 4: Create `packages/node/vitest.config.ts`**

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Create placeholder `packages/node/src/index.ts`**

```ts
export const PACKAGE_NAME = "@formsreach/node";
```

- [ ] **Step 6: Install workspace deps**

Run: `pnpm install`
Expected: `@formsreach/node` linked; no errors

- [ ] **Step 7: Commit**

```bash
git add packages/node
git commit -m "$(cat <<'EOF'
chore: scaffold @formsreach/node package

EOF
)"
```

---

### Task 2: Types and errors

**Files:**
- Create: `packages/node/src/types.ts`
- Create: `packages/node/src/errors.ts`
- Create: `packages/node/tests/errors.test.ts`
- Modify: `packages/node/src/index.ts`

**Interfaces:**
- Produces:
  - `API_BASE = "https://app.formsreach.com"`
  - `FormsReachError`, `FormsReachClientError`
  - Domain types: `Form`, `FormSummary`, `FormList`, `FormField`, `FormTheme`, `Submission`, `SubmissionList`, `ListSubmissionsOptions`, `AttachmentSignedUrl`, `FormsReachOptions`

- [ ] **Step 1: Write failing error test**

Create `packages/node/tests/errors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FormsReachClientError } from "@/errors";

describe("FormsReachClientError", () => {
  it("exposes formsreach payload and uses detail as message when present", () => {
    const err = new FormsReachClientError({
      type: "https://formsreach.com/problems/unauthorized",
      title: "Unauthorized",
      status: 401,
      code: "unauthorized",
      detail: "Missing or invalid API key",
      requestId: "req_1",
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("FormsReachClientError");
    expect(err.message).toBe("Missing or invalid API key");
    expect(err.formsreach.requestId).toBe("req_1");
    expect(err.formsreach.code).toBe("unauthorized");
  });

  it("falls back to title when detail is missing", () => {
    const err = new FormsReachClientError({
      type: "about:blank",
      title: "Request failed",
      status: 500,
      code: "request_failed",
    });
    expect(err.message).toBe("Request failed");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @formsreach/node test`
Expected: FAIL — cannot resolve `@/errors`

- [ ] **Step 3: Implement types and errors**

`packages/node/src/types.ts`:

```ts
/** Fixed management API origin. Internal — not a public configuration option. */
export const API_BASE = "https://app.formsreach.com";

export type FormsReachOptions = {
  /** Developer API key (Bearer). Requires forms:read and submissions:read for v1. */
  apiKey: string;
};

export type FormsReachError = {
  type?: string;
  title: string;
  status: number;
  code: string;
  detail?: string;
  errors?: Array<{ path: string; message: string }>;
  requestId?: string;
};

export type FormFieldType =
  | "text"
  | "email"
  | "textarea"
  | "phone"
  | "number"
  | "url"
  | "date"
  | "file"
  | "radio";

export type FormField = {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type FormTheme = {
  version: 1;
  preset?: "dark" | "light" | "soft";
  background: string;
  text: string;
  primary: string;
  primaryForeground: string;
  inputBackground: string;
  fontFamily: "inter" | "system" | "serif" | "mono";
  radius: "sm" | "md" | "lg";
  showTitle: boolean;
};

export type FormSummary = {
  id: string;
  name: string;
  description: string | null;
  source: string | null;
  isActive: boolean;
  apiKeyPrefix: string;
  allowedDomains: string[];
  enableApi: boolean;
  enableEmbed: boolean;
  enableThirdParty: boolean;
  publicSubmitUrl: string;
  publicFormUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type Form = FormSummary & {
  redirectEnabled: boolean;
  redirectUrl: string | null;
  apiKey: string;
  fields: FormField[];
  theme: FormTheme;
};

export type FormList = {
  items: FormSummary[];
};

export type SpamReason = "honeypot" | "time_trap";

export type Submission = {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  createdAt: string;
  isSpam: boolean;
  spamReason: SpamReason | null;
};

export type SubmissionList = {
  items: Submission[];
  nextCursor: string | null;
};

export type ListSubmissionsOptions = {
  limit?: number;
  cursor?: string;
  q?: string;
  spam?: boolean;
};

export type AttachmentSignedUrl = {
  url: string;
  expiresIn: number;
};
```

`packages/node/src/errors.ts`:

```ts
import type { FormsReachError } from "./types";

export class FormsReachClientError extends Error {
  readonly formsreach: FormsReachError;

  constructor(error: FormsReachError) {
    super(error.detail ?? error.title);
    this.name = "FormsReachClientError";
    this.formsreach = error;
  }
}
```

Update `packages/node/src/index.ts`:

```ts
export { FormsReachClientError } from "./errors";
export type {
  FormsReachOptions,
  FormsReachError,
  Form,
  FormSummary,
  FormList,
  FormField,
  FormFieldType,
  FormTheme,
  Submission,
  SubmissionList,
  ListSubmissionsOptions,
  AttachmentSignedUrl,
  SpamReason,
} from "./types";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @formsreach/node test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/node/src/types.ts packages/node/src/errors.ts \
  packages/node/src/index.ts packages/node/tests/errors.test.ts
git commit -m "$(cat <<'EOF'
feat(node): add types and FormsReachClientError

EOF
)"
```

---

### Task 3: HTTP client (`request` + envelope unwrap)

**Files:**
- Create: `packages/node/src/http.ts`
- Create: `packages/node/tests/http.test.ts`

**Interfaces:**
- Consumes: `API_BASE`, `FormsReachClientError`, `FormsReachError`
- Produces: `createHttp(apiKey)` → `{ request<T>(method, path, query?): Promise<T> }`
  - `path` is absolute under API, e.g. `/api/v1/forms`
  - Sends `Authorization: Bearer ${apiKey}`, `Accept: application/json`
  - Success: returns envelope `data`
  - Failure / network / bad JSON: throws `FormsReachClientError`

- [ ] **Step 1: Write failing HTTP tests**

Create `packages/node/tests/http.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttp } from "@/http";
import { FormsReachClientError } from "@/errors";
import { API_BASE } from "@/types";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createHttp", () => {
  it("GETs with Bearer auth and returns unwrapped data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: { items: [{ id: "f1" }] },
        status: "success",
        meta: { requestId: "r1" },
      }),
    );
    globalThis.fetch = fetchMock;

    const http = createHttp("dev_key_test");
    const data = await http.request<{ items: { id: string }[] }>(
      "GET",
      "/api/v1/forms",
    );

    expect(data.items[0].id).toBe("f1");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API_BASE}/api/v1/forms`);
    expect(init).toMatchObject({
      method: "GET",
      headers: {
        Authorization: "Bearer dev_key_test",
        Accept: "application/json",
      },
    });
  });

  it("appends query params, omitting undefined", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: { items: [], nextCursor: null },
        status: "success",
        meta: { requestId: "r2" },
      }),
    );
    globalThis.fetch = fetchMock;

    const http = createHttp("k");
    await http.request("GET", "/api/v1/forms/fid/submissions", {
      limit: 10,
      cursor: undefined,
      spam: false,
      q: "ada",
    });

    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(url.searchParams.get("limit")).toBe("10");
    expect(url.searchParams.get("spam")).toBe("false");
    expect(url.searchParams.get("q")).toBe("ada");
    expect(url.searchParams.has("cursor")).toBe(false);
  });

  it("throws FormsReachClientError on failure envelope", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          data: null,
          status: "failure",
          error: {
            type: "about:blank",
            title: "Forbidden",
            status: 403,
            code: "forbidden",
            detail: "Missing scope",
          },
          meta: { requestId: "r3" },
        },
        403,
      ),
    );

    const http = createHttp("k");
    await expect(http.request("GET", "/api/v1/forms")).rejects.toMatchObject({
      name: "FormsReachClientError",
      formsreach: {
        status: 403,
        code: "forbidden",
        requestId: "r3",
        detail: "Missing scope",
      },
    });
  });

  it("throws network_error when fetch rejects", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("offline"));
    const http = createHttp("k");
    await expect(http.request("GET", "/api/v1/forms")).rejects.toBeInstanceOf(
      FormsReachClientError,
    );
    try {
      await http.request("GET", "/api/v1/forms");
    } catch (e) {
      expect((e as FormsReachClientError).formsreach.code).toBe("network_error");
    }
  });

  it("throws invalid_response when body is not JSON", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("not-json", { status: 200 }),
    );
    const http = createHttp("k");
    await expect(http.request("GET", "/api/v1/forms")).rejects.toMatchObject({
      formsreach: { code: "invalid_response" },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @formsreach/node test`
Expected: FAIL — `@/http` missing

- [ ] **Step 3: Implement `packages/node/src/http.ts`**

```ts
import { FormsReachClientError } from "./errors";
import { API_BASE, type FormsReachError } from "./types";

type EnvelopeSuccess<T> = {
  status: "success";
  data: T;
  meta?: { requestId?: string };
};

type EnvelopeFailure = {
  status: "failure";
  data: null;
  error: {
    type?: string;
    title?: string;
    status?: number;
    code?: string;
    detail?: string;
    errors?: Array<{ path: string; message: string }>;
  };
  meta?: { requestId?: string };
};

export type HttpClient = {
  request: <T>(
    method: string,
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ) => Promise<T>;
};

function networkError(message: string): FormsReachError {
  return {
    status: 0,
    code: "network_error",
    title: "Network error",
    detail: message,
  };
}

function fromFailure(body: EnvelopeFailure, httpStatus: number): FormsReachError {
  const err = body.error ?? {};
  return {
    type: err.type,
    status: err.status ?? httpStatus,
    code: err.code ?? "request_failed",
    title: err.title ?? "Request failed",
    detail: err.detail,
    errors: err.errors,
    requestId: body.meta?.requestId,
  };
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(path, API_BASE);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export function createHttp(apiKey: string): HttpClient {
  return {
    async request<T>(method, path, query) {
      const url = buildUrl(path, query);
      let res: Response;
      try {
        res = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to fetch";
        throw new FormsReachClientError(networkError(message));
      }

      let body: unknown;
      try {
        body = await res.json();
      } catch {
        throw new FormsReachClientError({
          status: res.status,
          code: "invalid_response",
          title: "Invalid response",
          detail: "Response was not valid JSON.",
        });
      }

      const envelope = body as EnvelopeSuccess<T> | EnvelopeFailure;

      if (envelope && envelope.status === "success") {
        return envelope.data;
      }

      if (envelope && envelope.status === "failure") {
        throw new FormsReachClientError(fromFailure(envelope, res.status));
      }

      throw new FormsReachClientError({
        status: res.status,
        code: "unexpected_response",
        title: "Unexpected response",
        detail: "Response did not match the FormsReach envelope.",
      });
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @formsreach/node test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/node/src/http.ts packages/node/tests/http.test.ts
git commit -m "$(cat <<'EOF'
feat(node): add Bearer HTTP client with envelope unwrap

EOF
)"
```

---

### Task 4: Forms resource + `FormsReach` client

**Files:**
- Create: `packages/node/src/resources/forms.ts`
- Create: `packages/node/src/client.ts`
- Create: `packages/node/tests/forms.test.ts`
- Create: `packages/node/tests/client.test.ts`
- Modify: `packages/node/src/index.ts`

**Interfaces:**
- Consumes: `HttpClient`, `Form`, `FormList`, `FormsReachOptions`
- Produces:
  - `FormsResource`: `list(): Promise<FormList>`, `get(formId: string): Promise<Form>`
  - `class FormsReach { readonly forms; readonly submissions; constructor(options: FormsReachOptions) }`
  - Constructor throws `FormsReachClientError` (or `Error`) if `apiKey` is empty/whitespace — use `FormsReachClientError` with `code: "invalid_api_key"` for consistency

- [ ] **Step 1: Write failing tests**

`packages/node/tests/client.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FormsReach } from "@/client";
import { FormsReachClientError } from "@/errors";

describe("FormsReach constructor", () => {
  it("rejects empty apiKey", () => {
    expect(() => new FormsReach({ apiKey: "" })).toThrow(FormsReachClientError);
    expect(() => new FormsReach({ apiKey: "   " })).toThrow(FormsReachClientError);
  });

  it("exposes forms and submissions resources", () => {
    const fr = new FormsReach({ apiKey: "dev_key" });
    expect(fr.forms).toBeDefined();
    expect(fr.submissions).toBeDefined();
  });
});
```

`packages/node/tests/forms.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormsReach } from "@/client";
import { API_BASE } from "@/types";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("forms", () => {
  it("list calls GET /api/v1/forms", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { items: [] },
          status: "success",
          meta: { requestId: "r" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const fr = new FormsReach({ apiKey: "k" });
    const result = await fr.forms.list();
    expect(result).toEqual({ items: [] });
    expect(String(vi.mocked(fetch).mock.calls[0]![0])).toBe(
      `${API_BASE}/api/v1/forms`,
    );
  });

  it("get calls GET /api/v1/forms/{formId}", async () => {
    const form = {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Contact",
      description: null,
      source: null,
      isActive: true,
      redirectEnabled: false,
      redirectUrl: null,
      apiKey: "fr_xxx",
      apiKeyPrefix: "fr_xxx",
      allowedDomains: [],
      enableApi: true,
      enableEmbed: true,
      enableThirdParty: false,
      fields: [],
      theme: {
        version: 1 as const,
        background: "#fff",
        text: "#000",
        primary: "#00f",
        primaryForeground: "#fff",
        inputBackground: "#fff",
        fontFamily: "inter" as const,
        radius: "md" as const,
        showTitle: true,
      },
      publicSubmitUrl: "https://app.formsreach.com/api/v1/submit",
      publicFormUrl: "https://app.formsreach.com/f/x",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: form,
          status: "success",
          meta: { requestId: "r" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const fr = new FormsReach({ apiKey: "k" });
    const result = await fr.forms.get(form.id);
    expect(result.name).toBe("Contact");
    expect(String(vi.mocked(fetch).mock.calls[0]![0])).toBe(
      `${API_BASE}/api/v1/forms/${form.id}`,
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @formsreach/node test`
Expected: FAIL — `@/client` missing

- [ ] **Step 3: Implement forms resource and client**

`packages/node/src/resources/forms.ts`:

```ts
import type { HttpClient } from "../http";
import type { Form, FormList } from "../types";

export class FormsResource {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<FormList> {
    return this.http.request<FormList>("GET", "/api/v1/forms");
  }

  get(formId: string): Promise<Form> {
    return this.http.request<Form>("GET", `/api/v1/forms/${formId}`);
  }
}
```

`packages/node/src/resources/submissions.ts` (stub for constructor wiring — full methods in Task 5):

```ts
import type { HttpClient } from "../http";

export class SubmissionsResource {
  constructor(private readonly http: HttpClient) {}
}
```

`packages/node/src/client.ts`:

```ts
import { FormsReachClientError } from "./errors";
import { createHttp } from "./http";
import { FormsResource } from "./resources/forms";
import { SubmissionsResource } from "./resources/submissions";
import type { FormsReachOptions } from "./types";

export class FormsReach {
  readonly forms: FormsResource;
  readonly submissions: SubmissionsResource;

  constructor(options: FormsReachOptions) {
    const apiKey = options.apiKey?.trim() ?? "";
    if (!apiKey) {
      throw new FormsReachClientError({
        status: 0,
        code: "invalid_api_key",
        title: "Invalid API key",
        detail: "apiKey must be a non-empty string.",
      });
    }
    const http = createHttp(apiKey);
    this.forms = new FormsResource(http);
    this.submissions = new SubmissionsResource(http);
  }
}
```

Update `packages/node/src/index.ts` to also export `FormsReach` as named + default:

```ts
export { FormsReach } from "./client";
export { FormsReachClientError } from "./errors";
export type {
  FormsReachOptions,
  FormsReachError,
  Form,
  FormSummary,
  FormList,
  FormField,
  FormFieldType,
  FormTheme,
  Submission,
  SubmissionList,
  ListSubmissionsOptions,
  AttachmentSignedUrl,
  SpamReason,
} from "./types";

import { FormsReach } from "./client";
export default FormsReach;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @formsreach/node test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/node/src packages/node/tests/client.test.ts \
  packages/node/tests/forms.test.ts
git commit -m "$(cat <<'EOF'
feat(node): add FormsReach client and forms.list/get

EOF
)"
```

---

### Task 5: Submissions resource

**Files:**
- Modify: `packages/node/src/resources/submissions.ts`
- Create: `packages/node/tests/submissions.test.ts`

**Interfaces:**
- Consumes: `HttpClient`, `Submission`, `SubmissionList`, `ListSubmissionsOptions`, `AttachmentSignedUrl`
- Produces:
  - `list(formId, options?): Promise<SubmissionList>`
  - `get(formId, submissionId): Promise<Submission>`
  - `export(formId): Promise<string>` (CSV body)
  - `getAttachmentUrl(formId, submissionId, attachmentId): Promise<AttachmentSignedUrl>`

- [ ] **Step 1: Write failing submissions tests**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormsReach } from "@/client";
import { API_BASE } from "@/types";

const originalFetch = globalThis.fetch;
const formId = "11111111-1111-4111-8111-111111111111";
const submissionId = "22222222-2222-4222-8222-222222222222";
const attachmentId = "33333333-3333-4333-8333-333333333333";

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function ok(data: unknown): Response {
  return new Response(
    JSON.stringify({ data, status: "success", meta: { requestId: "r" } }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("submissions", () => {
  it("list passes query params", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      ok({ items: [], nextCursor: null }),
    );
    const fr = new FormsReach({ apiKey: "k" });
    await fr.submissions.list(formId, {
      limit: 25,
      cursor: "cur_1",
      q: "hello",
      spam: true,
    });
    const url = new URL(String(vi.mocked(fetch).mock.calls[0]![0]));
    expect(url.pathname).toBe(`/api/v1/forms/${formId}/submissions`);
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.get("cursor")).toBe("cur_1");
    expect(url.searchParams.get("q")).toBe("hello");
    expect(url.searchParams.get("spam")).toBe("true");
  });

  it("get fetches a single submission", async () => {
    const submission = {
      id: submissionId,
      formId,
      data: { email: "a@b.co" },
      createdAt: "2026-01-01T00:00:00Z",
      isSpam: false,
      spamReason: null,
    };
    globalThis.fetch = vi.fn().mockResolvedValue(ok(submission));
    const fr = new FormsReach({ apiKey: "k" });
    const result = await fr.submissions.get(formId, submissionId);
    expect(result).toEqual(submission);
    expect(String(vi.mocked(fetch).mock.calls[0]![0])).toBe(
      `${API_BASE}/api/v1/forms/${formId}/submissions/${submissionId}`,
    );
  });

  it("export returns CSV string from data", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(ok("id,email\n1,a@b.co\n"));
    const fr = new FormsReach({ apiKey: "k" });
    const csv = await fr.submissions.export(formId);
    expect(csv).toContain("email");
    expect(String(vi.mocked(fetch).mock.calls[0]![0])).toBe(
      `${API_BASE}/api/v1/forms/${formId}/submissions/export`,
    );
  });

  it("getAttachmentUrl returns signed url payload", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      ok({ url: "https://signed.example/file", expiresIn: 60 }),
    );
    const fr = new FormsReach({ apiKey: "k" });
    const result = await fr.submissions.getAttachmentUrl(
      formId,
      submissionId,
      attachmentId,
    );
    expect(result.url).toContain("https://");
    expect(String(vi.mocked(fetch).mock.calls[0]![0])).toBe(
      `${API_BASE}/api/v1/forms/${formId}/submissions/${submissionId}/attachments/${attachmentId}/url`,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @formsreach/node test`
Expected: FAIL — `list` is not a function (stub resource)

- [ ] **Step 3: Implement submissions methods**

Replace `packages/node/src/resources/submissions.ts`:

```ts
import type { HttpClient } from "../http";
import type {
  AttachmentSignedUrl,
  ListSubmissionsOptions,
  Submission,
  SubmissionList,
} from "../types";

export class SubmissionsResource {
  constructor(private readonly http: HttpClient) {}

  list(
    formId: string,
    options: ListSubmissionsOptions = {},
  ): Promise<SubmissionList> {
    return this.http.request<SubmissionList>(
      "GET",
      `/api/v1/forms/${formId}/submissions`,
      {
        limit: options.limit,
        cursor: options.cursor,
        q: options.q,
        spam: options.spam,
      },
    );
  }

  get(formId: string, submissionId: string): Promise<Submission> {
    return this.http.request<Submission>(
      "GET",
      `/api/v1/forms/${formId}/submissions/${submissionId}`,
    );
  }

  export(formId: string): Promise<string> {
    return this.http.request<string>(
      "GET",
      `/api/v1/forms/${formId}/submissions/export`,
    );
  }

  getAttachmentUrl(
    formId: string,
    submissionId: string,
    attachmentId: string,
  ): Promise<AttachmentSignedUrl> {
    return this.http.request<AttachmentSignedUrl>(
      "GET",
      `/api/v1/forms/${formId}/submissions/${submissionId}/attachments/${attachmentId}/url`,
    );
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @formsreach/node test && pnpm --filter @formsreach/node typecheck && pnpm --filter @formsreach/node build`
Expected: all PASS / exit 0

- [ ] **Step 5: Commit**

```bash
git add packages/node/src/resources/submissions.ts \
  packages/node/tests/submissions.test.ts
git commit -m "$(cat <<'EOF'
feat(node): add submissions list/get/export/attachment URL

EOF
)"
```

---

### Task 6: Package README + AGENTS.md

**Files:**
- Create: `packages/node/README.md`
- Create: `packages/node/AGENTS.md`

**Interfaces:**
- Produces: published docs matching the design (install, auth contrast, all v1 methods, errors, example link)

- [ ] **Step 1: Write `packages/node/README.md`**

Include at minimum:

- Title `@formsreach/node`, one-line description (management SDK, not browser submit)
- Install: `npm install @formsreach/node`
- Auth section: developer API key via `FORMSREACH_API_KEY`; scopes `forms:read` + `submissions:read`; **not** the public form `fr_…` key used by `@formsreach/js`
- Quick start code block using `FormsReach` for list forms, get form, list/get/export submissions, `getAttachmentUrl`
- Errors: `FormsReachClientError` / `.formsreach`
- Link to `../../examples/node` and `./AGENTS.md`
- Build: `pnpm --filter @formsreach/node build`
- License MIT

- [ ] **Step 2: Write `packages/node/AGENTS.md`**

Mirror structure of `packages/js/AGENTS.md`: when to use, public API table, backend contract (Bearer, fixed host, envelope), do/don't (no baseUrl, no public fr_ key, no /me in v1), related packages.

- [ ] **Step 3: Commit**

```bash
git add packages/node/README.md packages/node/AGENTS.md
git commit -m "$(cat <<'EOF'
docs(node): add README and AGENTS guide

EOF
)"
```

---

### Task 7: `examples/node`

**Files:**
- Create: `examples/node/package.json`
- Create: `examples/node/tsconfig.json`
- Create: `examples/node/index.ts`
- Create: `examples/node/README.md`

**Interfaces:**
- Consumes: workspace `@formsreach/node`
- Produces: runnable example listing forms + submissions

- [ ] **Step 1: Create example package files**

`examples/node/package.json`:

```json
{
  "name": "@formsreach/example-node",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "description": "Node example for @formsreach/node",
  "scripts": {
    "start": "tsx index.ts"
  },
  "dependencies": {
    "@formsreach/node": "workspace:*"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

`examples/node/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["index.ts"]
}
```

`examples/node/index.ts`:

```ts
import { FormsReach, FormsReachClientError } from "@formsreach/node";

async function main() {
  const apiKey = process.env.FORMSREACH_API_KEY?.trim();
  if (!apiKey) {
    console.error("Set FORMSREACH_API_KEY to a developer API key.");
    process.exit(1);
  }

  const fr = new FormsReach({ apiKey });

  const { items: forms } = await fr.forms.list();
  console.log(`Forms: ${forms.length}`);
  for (const f of forms) {
    console.log(`- ${f.name} (${f.id}) active=${f.isActive}`);
  }

  const formId = process.env.FORM_ID?.trim() || forms[0]?.id;
  if (!formId) {
    console.log("No forms found.");
    return;
  }

  const form = await fr.forms.get(formId);
  console.log(`\nForm detail: ${form.name} fields=${form.fields.length}`);

  const page = await fr.submissions.list(formId, { limit: 10 });
  console.log(`\nSubmissions (page): ${page.items.length}`);
  for (const s of page.items) {
    console.log(`- ${s.id} spam=${s.isSpam} at ${s.createdAt}`);
  }
  if (page.nextCursor) {
    console.log(`nextCursor: ${page.nextCursor}`);
  }

  const csv = await fr.submissions.export(formId);
  console.log(`\nCSV export length: ${csv.length} chars`);
}

main().catch((err) => {
  if (err instanceof FormsReachClientError) {
    console.error("FormsReach error:", err.formsreach);
  } else {
    console.error(err);
  }
  process.exit(1);
});
```

`examples/node/README.md`:

- Prerequisites: Node ≥20, developer API key with `forms:read` + `submissions:read`
- `pnpm install` from repo root
- `cd examples/node && FORMSREACH_API_KEY=… pnpm start`
- Optional `FORM_ID=…`
- Link to `../../packages/node`

- [ ] **Step 2: Install and typecheck example**

Run: `pnpm install && pnpm --filter @formsreach/node build`
Expected: success (do not call live API in CI)

- [ ] **Step 3: Commit**

```bash
git add examples/node
git commit -m "$(cat <<'EOF'
feat(examples): add Node management SDK example

EOF
)"
```

---

### Task 8: Root docs + monorepo verification

**Files:**
- Modify: `AGENTS.md` (package table + note Node management SDK)
- Modify: `README.md` (packages table + short Node section)
- Create: `.changeset/` entry for `@formsreach/node` initial release (optional if publish is later — **do create** a changeset so versioning is tracked)

**Interfaces:**
- Produces: root docs discover `@formsreach/node`; `pnpm check` green for packages

- [ ] **Step 1: Update root `AGENTS.md`**

Add row to Packages table:

`| `@formsreach/node` | Node management SDK (forms/submissions, Bearer developer key) |`

Add a short "Management API (Node)" bullet under Product API noting fixed `https://app.formsreach.com`, Bearer developer key, and link to the design spec. Keep the existing rule: do not expose configurable endpoints.

- [ ] **Step 2: Update root `README.md`**

- Add npm badge for `@formsreach/node` when appropriate (optional until published)
- Add packages table row
- Add "### Node.js (management)" quick start with `npm install @formsreach/node` and 5–10 lines using `FormsReach`
- Link `examples/node`

- [ ] **Step 3: Add changeset**

Run: `pnpm changeset` selecting `@formsreach/node` as minor (or create markdown manually under `.changeset/`):

```md
---
"@formsreach/node": minor
---

Initial `@formsreach/node` management SDK: forms list/get and submissions list/get/export/attachment URL with Bearer developer API keys.
```

- [ ] **Step 4: Full verification**

Run: `pnpm --filter @formsreach/node test && pnpm --filter @formsreach/node typecheck && pnpm --filter @formsreach/node build && pnpm lint`
Expected: all pass (fix lint paths if eslint globs already cover `packages/**`)

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md README.md .changeset
git commit -m "$(cat <<'EOF'
docs: register @formsreach/node in root docs and changeset

EOF
)"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|---|---|
| Bearer auth, fixed host | 3, 4 |
| forms.list / forms.get | 4 |
| submissions list/get/export/attachment | 5 |
| Envelope unwrap + FormsReachClientError | 2, 3 |
| Zero deps, tsup, Vitest | 1 |
| Package README + AGENTS.md | 6 |
| examples/node | 7 |
| Root AGENTS.md update | 8 |
| `/me` / writes / baseUrl out of scope | Not implemented (intentional) |

**Placeholder scan:** none intentionally left.  
**Type consistency:** `FormsReach`, `FormsResource`, `SubmissionsResource`, `ListSubmissionsOptions`, `createHttp` / `HttpClient` names used consistently across tasks.
