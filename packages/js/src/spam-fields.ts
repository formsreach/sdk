/** Visually hidden honeypot — match product snippet styles. */
const HONEYPOT_STYLE =
  "position:absolute;left:-9999px;height:0;width:0;overflow:hidden";

export type EnsureSpamFieldsOptions = {
  /** Render timestamp (ms). Defaults to Date.now() when a new/empty `_ts` is set. */
  ts?: string | number;
};

/**
 * Ensure form has honeypot `_gotcha` and time-trap `_ts` controls.
 * Idempotent. Never clears a filled honeypot or overwrites a non-empty `_ts`.
 */
export function ensureSpamFields(
  form: HTMLFormElement,
  options?: EnsureSpamFieldsOptions,
): void {
  if (!(form instanceof HTMLFormElement)) return;

  let gotcha = form.querySelector<HTMLInputElement>('input[name="_gotcha"]');
  if (!gotcha) {
    gotcha = document.createElement("input");
    gotcha.type = "text";
    gotcha.name = "_gotcha";
    gotcha.value = "";
    gotcha.tabIndex = -1;
    gotcha.autocomplete = "off";
    gotcha.setAttribute("aria-hidden", "true");
    gotcha.style.cssText = HONEYPOT_STYLE;
    form.appendChild(gotcha);
  }

  let tsInput = form.querySelector<HTMLInputElement>('input[name="_ts"]');
  const tsValue = String(options?.ts ?? Date.now());
  if (!tsInput) {
    tsInput = document.createElement("input");
    tsInput.type = "hidden";
    tsInput.name = "_ts";
    tsInput.value = tsValue;
    form.appendChild(tsInput);
  } else if (tsInput.value === "") {
    tsInput.value = tsValue;
  }
}
