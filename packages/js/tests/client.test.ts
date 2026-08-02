import { afterEach, describe, expect, it, vi } from "vitest";
import { FormsReachClientError, submitForm } from "@/client";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("submitForm", () => {
  it("returns success from envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({
          status: "success",
          data: {
            ok: true,
            id: "11111111-1111-1111-1111-111111111111",
            redirectUrl: null,
          },
          meta: { requestId: "req_1" },
        }),
      }),
    );

    const result = await submitForm({
      apiKey: "fr_test",
      data: { name: "Ada" },
    });

    expect(result).toEqual({
      id: "11111111-1111-1111-1111-111111111111",
      redirectUrl: null,
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://app.formsreach.com/api/v1/submit",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }),
    );

    const body = JSON.parse(
      (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string,
    );
    expect(body).toMatchObject({
      name: "Ada",
      api_key: "fr_test",
      _gotcha: "",
    });
  });

  it("throws FormsReachClientError on failure envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 403,
        json: async () => ({
          status: "failure",
          data: null,
          error: {
            status: 403,
            code: "domain_not_allowed",
            title: "Forbidden",
            detail: "Origin not allowed",
          },
          meta: { requestId: "req_2" },
        }),
      }),
    );

    await expect(
      submitForm({ apiKey: "fr_test", data: { name: "Ada" } }),
    ).rejects.toMatchObject({
      name: "FormsReachClientError",
      formsreach: {
        code: "domain_not_allowed",
        status: 403,
        requestId: "req_2",
      },
    });
  });

  it("maps network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    try {
      await submitForm({ apiKey: "fr_test", data: {} });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(FormsReachClientError);
      expect((e as FormsReachClientError).formsreach.code).toBe(
        "network_error",
      );
    }
  });
});
