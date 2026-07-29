import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFormsReach } from "@/use-forms-reach";

const submitForm = vi.fn();

vi.mock("@formsreach/js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@formsreach/js")>();
  return {
    ...actual,
    submitForm: (...args: unknown[]) => submitForm(...args),
  };
});

describe("useFormsReach", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    submitForm.mockReset();
    submitForm.mockResolvedValue({ id: "1", redirectUrl: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("injects spam fields into the form payload on submit", async () => {
    document.body.innerHTML = `
      <form id="f">
        <input name="name" value="Ada" />
        <button type="submit">Go</button>
      </form>
    `;
    const form = document.getElementById("f") as HTMLFormElement;
    const { submit } = useFormsReach("fr_test");

    const event = new Event("submit", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "target", { value: form });
    submit(event);

    await vi.waitFor(() => {
      expect(submitForm).toHaveBeenCalled();
    });

    const arg = submitForm.mock.calls[0][0] as {
      apiKey: string;
      data: Record<string, string>;
    };
    expect(arg.apiKey).toBe("fr_test");
    expect(arg.data.name).toBe("Ada");
    expect(arg.data._gotcha).toBe("");
    expect(arg.data._ts).toMatch(/^\d+$/);
  });
});
