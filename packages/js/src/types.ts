/** Result returned on a successful public submission. */
export type FormsReachSuccess = {
  id: string;
  redirectUrl: string | null;
};

/** Normalized client error (from API problem envelope or network). */
export type FormsReachError = {
  status: number;
  code: string;
  title: string;
  detail?: string;
  requestId?: string;
};

export type FormsReachInitOptions = {
  /** Form API key from the FormsReach dashboard (`fr_…`). */
  apiKey: string;
  onSuccess?: (result: FormsReachSuccess) => void;
  onError?: (error: FormsReachError) => void;
};

export type SubmitFormOptions = {
  apiKey: string;
  data: Record<string, string>;
};

/** Fixed FormsReach submit URL. Internal — not part of the public API. */
export const SUBMIT_ENDPOINT = "https://app.formsreach.com/api/v1/submit";

export const FORM_ATTR = "data-formsreach";

export const EVENT_SUCCESS = "formsreach:success";
export const EVENT_ERROR = "formsreach:error";
