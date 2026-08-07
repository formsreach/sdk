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
      expect((e as FormsReachClientError).formsreach.code).toBe(
        "network_error",
      );
    }
  });

  it("throws invalid_response when body is not JSON", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response("not-json", { status: 200 }));
    const http = createHttp("k");
    await expect(http.request("GET", "/api/v1/forms")).rejects.toMatchObject({
      formsreach: { code: "invalid_response" },
    });
  });
});
