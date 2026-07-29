import { beforeEach, describe, expect, it } from "vitest";
import { ensureSpamFields } from "@/spam-fields";

describe("ensureSpamFields", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("injects empty _gotcha and _ts when missing", () => {
    document.body.innerHTML = `<form id="f"><input name="name" value="Ada" /></form>`;
    const form = document.getElementById("f") as HTMLFormElement;
    ensureSpamFields(form, { ts: 1_700_000_000_000 });

    const gotcha = form.querySelector<HTMLInputElement>('[name="_gotcha"]');
    const ts = form.querySelector<HTMLInputElement>('[name="_ts"]');
    expect(gotcha).toBeTruthy();
    expect(gotcha!.value).toBe("");
    expect(ts).toBeTruthy();
    expect(ts!.value).toBe("1700000000000");
    expect(ts!.type).toBe("hidden");
  });

  it("preserves filled honeypot", () => {
    document.body.innerHTML = `<form id="f"><input name="_gotcha" value="bot" /></form>`;
    const form = document.getElementById("f") as HTMLFormElement;
    ensureSpamFields(form);
    expect(
      form.querySelector<HTMLInputElement>('[name="_gotcha"]')!.value,
    ).toBe("bot");
  });

  it("does not overwrite non-empty _ts", () => {
    document.body.innerHTML = `<form id="f"><input type="hidden" name="_ts" value="99" /></form>`;
    const form = document.getElementById("f") as HTMLFormElement;
    ensureSpamFields(form, { ts: 123 });
    expect(form.querySelector<HTMLInputElement>('[name="_ts"]')!.value).toBe(
      "99",
    );
  });

  it("fills empty _ts once from options.ts", () => {
    document.body.innerHTML = `<form id="f"><input type="hidden" name="_ts" value="" /></form>`;
    const form = document.getElementById("f") as HTMLFormElement;
    ensureSpamFields(form, { ts: 42 });
    expect(form.querySelector<HTMLInputElement>('[name="_ts"]')!.value).toBe(
      "42",
    );
  });

  it("is idempotent (single pair of controls)", () => {
    document.body.innerHTML = `<form id="f"></form>`;
    const form = document.getElementById("f") as HTMLFormElement;
    ensureSpamFields(form, { ts: 1 });
    ensureSpamFields(form, { ts: 2 });
    expect(form.querySelectorAll('[name="_gotcha"]').length).toBe(1);
    expect(form.querySelectorAll('[name="_ts"]').length).toBe(1);
    expect(form.querySelector<HTMLInputElement>('[name="_ts"]')!.value).toBe(
      "1",
    );
  });
});
