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
