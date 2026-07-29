import { afterEach, describe, expect, it, vi } from "vitest";
import { init } from "@/init";
import { __resetBindForTests } from "@/bind";

afterEach(() => {
  __resetBindForTests();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("init", () => {
  it("throws without apiKey", () => {
    expect(() => init({ apiKey: "" })).toThrow(/apiKey is required/);
    // @ts-expect-error intentional
    expect(() => init({})).toThrow(/apiKey is required/);
  });

  it("intercepts data-formsreach forms and posts JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        status: "success",
        data: {
          ok: true,
          id: "22222222-2222-2222-2222-222222222222",
          redirectUrl: null,
        },
        meta: { requestId: "req" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const onSuccess = vi.fn();
    init({ apiKey: "fr_test", onSuccess });

    document.body.innerHTML = `
      <form data-formsreach id="f">
        <input name="message" value="hello" />
        <button type="submit">Go</button>
      </form>
    `;
    const form = document.getElementById("f") as HTMLFormElement;
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        id: "22222222-2222-2222-2222-222222222222",
        redirectUrl: null,
      });
    });

    expect(fetchMock).toHaveBeenCalled();
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    ) as Record<string, string>;
    expect(body.api_key).toBe("fr_test");
    expect(body.message).toBe("hello");
    expect(body._gotcha).toBe("");
    expect(body._ts).toMatch(/^\d+$/);
    expect(Number(body._ts)).toBeGreaterThan(0);
  });

  it("injects spam fields when form exists before init", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        status: "success",
        data: {
          ok: true,
          id: "33333333-3333-3333-3333-333333333333",
          redirectUrl: null,
        },
        meta: { requestId: "req" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    document.body.innerHTML = `
      <form data-formsreach id="early">
        <input name="message" value="early" />
        <button type="submit">Go</button>
      </form>
    `;
    init({ apiKey: "fr_early" });

    const form = document.getElementById("early") as HTMLFormElement;
    expect(form.querySelector('[name="_gotcha"]')).toBeTruthy();
    expect(form.querySelector('[name="_ts"]')).toBeTruthy();

    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    ) as Record<string, string>;
    expect(body._gotcha).toBe("");
    expect(body._ts).toMatch(/^\d+$/);
  });

  it("does not intercept forms without data-formsreach", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    init({ apiKey: "fr_test" });

    document.body.innerHTML = `
      <form id="plain">
        <button type="submit">Go</button>
      </form>
    `;
    const form = document.getElementById("plain") as HTMLFormElement;
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    await new Promise((r) => setTimeout(r, 20));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
