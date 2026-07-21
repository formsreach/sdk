import { describe, expect, it } from "vitest";
import { formToPayload, withSubmitMeta } from "./serialize";

describe("withSubmitMeta", () => {
  it("injects api_key and empty honeypot", () => {
    expect(withSubmitMeta({ name: "Ada" }, "fr_test")).toEqual({
      name: "Ada",
      api_key: "fr_test",
      _gotcha: "",
    });
  });

  it("preserves existing honeypot", () => {
    expect(withSubmitMeta({ _gotcha: "bot" }, "fr_test")._gotcha).toBe("bot");
  });
});

describe("formToPayload", () => {
  it("serializes string fields and injects meta", () => {
    document.body.innerHTML = `
      <form id="f">
        <input name="name" value="Ada" />
        <input name="email" value="ada@example.com" />
      </form>
    `;
    const form = document.getElementById("f") as HTMLFormElement;
    expect(formToPayload(form, "fr_key")).toEqual({
      name: "Ada",
      email: "ada@example.com",
      api_key: "fr_key",
      _gotcha: "",
    });
  });
});
