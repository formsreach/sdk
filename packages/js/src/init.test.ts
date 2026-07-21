import { afterEach, describe, expect, it, vi } from "vitest";
import { init } from "./init";
import { __resetBindForTests } from "./bind";

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
