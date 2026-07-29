import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { useFormsReach } from "@/use-forms-reach";

const submitForm = vi.fn();

vi.mock("@formsreach/js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@formsreach/js")>();
  return {
    ...actual,
    submitForm: (...args: unknown[]) => submitForm(...args),
  };
});

function Harness({
  onReady,
}: {
  onReady: (submit: (e: React.FormEvent<HTMLFormElement>) => void) => void;
}) {
  const { submit } = useFormsReach("fr_test");
  useEffect(() => {
    onReady(submit);
  }, [submit, onReady]);
  return createElement(
    "form",
    { id: "f", onSubmit: submit },
    createElement("input", { name: "name", defaultValue: "Ada" }),
    createElement("button", { type: "submit" }, "Go"),
  );
}

describe("useFormsReach", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    submitForm.mockReset();
    submitForm.mockResolvedValue({ id: "1", redirectUrl: null });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("injects spam fields into the form payload on submit", async () => {
    let submitFn: ((e: React.FormEvent<HTMLFormElement>) => void) | null = null;

    await act(async () => {
      root.render(
        createElement(Harness, {
          onReady: (submit) => {
            submitFn = submit;
          },
        }),
      );
    });

    await vi.waitFor(() => {
      expect(submitFn).toBeTruthy();
    });

    const form = container.querySelector("form") as HTMLFormElement;
    const event = {
      preventDefault: vi.fn(),
      currentTarget: form,
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      submitFn!(event);
    });

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
