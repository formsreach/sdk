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
      allowedDomains: [] as string[],
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
