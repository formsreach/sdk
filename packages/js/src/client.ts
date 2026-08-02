import {
  SUBMIT_ENDPOINT,
  type FormsReachError,
  type FormsReachSuccess,
  type SubmitFormOptions,
} from "./types";
import { withSubmitMeta } from "./serialize";

type EnvelopeSuccess = {
  status: "success";
  data: { ok: true; id: string; redirectUrl: string | null };
  meta?: { requestId?: string };
};

type EnvelopeFailure = {
  status: "failure";
  data: null;
  error: {
    status?: number;
    code?: string;
    title?: string;
    detail?: string;
  };
  meta?: { requestId?: string };
};

export class FormsReachClientError extends Error {
  readonly formsreach: FormsReachError;

  constructor(error: FormsReachError) {
    super(error.detail ?? error.title);
    this.name = "FormsReachClientError";
    this.formsreach = error;
  }
}

function networkError(message: string): FormsReachError {
  return {
    status: 0,
    code: "network_error",
    title: "Network error",
    detail: message,
  };
}

function fromFailure(
  body: EnvelopeFailure,
  httpStatus: number,
): FormsReachError {
  const err = body.error ?? {};
  return {
    status: err.status ?? httpStatus,
    code: err.code ?? "request_failed",
    title: err.title ?? "Request failed",
    detail: err.detail,
    requestId: body.meta?.requestId,
  };
}

/**
 * Programmatic submit used by the auto-bind SDK and framework packages.
 * Not required for the HTML snippet path (use FormsReach.init instead).
 */
export async function submitForm(
  options: SubmitFormOptions,
): Promise<FormsReachSuccess> {
  const payload = withSubmitMeta(options.data, options.apiKey);

  let res: Response;
  try {
    res = await fetch(SUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch";
    throw new FormsReachClientError(networkError(message));
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new FormsReachClientError({
      status: res.status,
      code: "invalid_response",
      title: "Invalid response",
      detail: "Response was not valid JSON.",
    });
  }

  const envelope = body as EnvelopeSuccess | EnvelopeFailure;

  if (envelope && envelope.status === "success" && envelope.data?.ok) {
    return {
      id: envelope.data.id,
      redirectUrl: envelope.data.redirectUrl ?? null,
    };
  }

  if (envelope && envelope.status === "failure") {
    throw new FormsReachClientError(fromFailure(envelope, res.status));
  }

  throw new FormsReachClientError({
    status: res.status,
    code: "unexpected_response",
    title: "Unexpected response",
    detail: "Response did not match the FormsReach envelope.",
  });
}
