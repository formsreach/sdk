import { submitForm, FormsReachClientError } from "./client";
import { dispatchError, dispatchSuccess } from "./events";
import { formToPayload } from "./serialize";
import { ensureSpamFields } from "./spam-fields";
import { FORM_ATTR, type FormsReachInitOptions } from "./types";

let listenerInstalled = false;
let config: FormsReachInitOptions | null = null;
const inFlight = new WeakSet<HTMLFormElement>();
let observer: MutationObserver | null = null;

function isFormsReachForm(el: EventTarget | null): el is HTMLFormElement {
  return el instanceof HTMLFormElement && el.hasAttribute(FORM_ATTR);
}

function ensureAllForms(): void {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll<HTMLFormElement>(`form[${FORM_ATTR}]`)
    .forEach((form) => ensureSpamFields(form));
}

function ensureObserver(): void {
  if (
    observer ||
    typeof MutationObserver === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }
  observer = new MutationObserver(() => {
    ensureAllForms();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function setBusy(form: HTMLFormElement, busy: boolean): void {
  if (busy) {
    form.setAttribute("aria-busy", "true");
  } else {
    form.removeAttribute("aria-busy");
  }

  const controls = form.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
    'button[type="submit"], input[type="submit"]',
  );
  for (const el of controls) {
    el.disabled = busy;
  }
}

async function handleSubmit(event: Event): Promise<void> {
  if (!isFormsReachForm(event.target)) return;
  if (!config) return;

  event.preventDefault();
  const form = event.target;

  if (inFlight.has(form)) return;
  inFlight.add(form);
  setBusy(form, true);

  try {
    ensureSpamFields(form);
    const data = formToPayload(form, config.apiKey);
    const result = await submitForm({
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      data,
    });

    config.onSuccess?.(result);
    dispatchSuccess(form, result);

    if (result.redirectUrl) {
      window.location.assign(result.redirectUrl);
      return;
    }
  } catch (e) {
    const error =
      e instanceof FormsReachClientError
        ? e.formsreach
        : {
            status: 0,
            code: "unknown_error",
            title: "Unknown error",
            detail: e instanceof Error ? e.message : String(e),
          };
    config.onError?.(error);
    dispatchError(form, error);
  } finally {
    inFlight.delete(form);
    // Skip re-enable if we navigated away (still safe if assign is async).
    if (document.contains(form)) {
      setBusy(form, false);
    }
  }
}

export function setConfig(options: FormsReachInitOptions): void {
  config = options;
}

export function ensureListener(): void {
  if (listenerInstalled || typeof document === "undefined") return;
  document.addEventListener("submit", handleSubmit, true);
  listenerInstalled = true;
  ensureAllForms();
  ensureObserver();
}

/** Test helper — reset module state. */
export function __resetBindForTests(): void {
  config = null;
  listenerInstalled = false;
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (typeof document !== "undefined") {
    document.removeEventListener("submit", handleSubmit, true);
  }
}
