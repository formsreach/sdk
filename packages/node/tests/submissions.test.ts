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
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(ok({ items: [], nextCursor: null }));
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
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
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
