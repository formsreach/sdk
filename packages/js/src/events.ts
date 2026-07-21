import {
  EVENT_ERROR,
  EVENT_SUCCESS,
  type FormsReachError,
  type FormsReachSuccess,
} from "./types";

export function dispatchSuccess(
  form: HTMLFormElement,
  result: FormsReachSuccess,
): void {
  form.dispatchEvent(
    new CustomEvent(EVENT_SUCCESS, {
      bubbles: true,
      detail: result,
    }),
  );
}

export function dispatchError(
  form: HTMLFormElement,
  error: FormsReachError,
): void {
  form.dispatchEvent(
    new CustomEvent(EVENT_ERROR, {
      bubbles: true,
      detail: error,
    }),
  );
}
