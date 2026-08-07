import type { FormsReachError } from "./types";

export class FormsReachClientError extends Error {
  readonly formsreach: FormsReachError;

  constructor(error: FormsReachError) {
    super(error.detail ?? error.title);
    this.name = "FormsReachClientError";
    this.formsreach = error;
  }
}
