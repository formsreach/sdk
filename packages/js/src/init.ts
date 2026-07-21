import { ensureListener, setConfig } from "./bind";
import type { FormsReachInitOptions } from "./types";

/**
 * Initialize FormsReach for the page. Call once after loading the script.
 * Forms marked with `data-formsreach` are auto-bound on submit.
 */
export function init(options: FormsReachInitOptions): void {
  if (!options || typeof options.apiKey !== "string" || !options.apiKey.trim()) {
    throw new Error("FormsReach.init: apiKey is required");
  }

  setConfig({
    apiKey: options.apiKey.trim(),
    endpoint: options.endpoint,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
  ensureListener();
}
