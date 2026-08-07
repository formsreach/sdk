import { describe, expect, it } from "vitest";
import { FormsReach } from "@/client";
import { FormsReachClientError } from "@/errors";

describe("FormsReach constructor", () => {
  it("rejects empty apiKey", () => {
    expect(() => new FormsReach({ apiKey: "" })).toThrow(FormsReachClientError);
    expect(() => new FormsReach({ apiKey: "   " })).toThrow(
      FormsReachClientError,
    );
  });

  it("exposes forms and submissions resources", () => {
    const fr = new FormsReach({ apiKey: "dev_key" });
    expect(fr.forms).toBeDefined();
    expect(fr.submissions).toBeDefined();
  });
});
