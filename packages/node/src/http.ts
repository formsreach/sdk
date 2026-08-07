import { FormsReachClientError } from "./errors";
import { API_BASE, type FormsReachError } from "./types";

type EnvelopeSuccess<T> = {
  status: "success";
  data: T;
  meta?: { requestId?: string };
};

type EnvelopeFailure = {
  status: "failure";
  data: null;
  error: {
    type?: string;
    title?: string;
    status?: number;
    code?: string;
    detail?: string;
    errors?: Array<{ path: string; message: string }>;
  };
  meta?: { requestId?: string };
};

export type HttpClient = {
  request: <T>(
    method: string,
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ) => Promise<T>;
};

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
    type: err.type,
    status: err.status ?? httpStatus,
    code: err.code ?? "request_failed",
    title: err.title ?? "Request failed",
    detail: err.detail,
    errors: err.errors,
    requestId: body.meta?.requestId,
  };
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(path, API_BASE);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export function createHttp(apiKey: string): HttpClient {
  return {
    async request<T>(
      method: string,
      path: string,
      query?: Record<string, string | number | boolean | undefined>,
    ): Promise<T> {
      const url = buildUrl(path, query);
      let res: Response;
      try {
        res = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
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

      const envelope = body as EnvelopeSuccess<T> | EnvelopeFailure;

      if (envelope && envelope.status === "success") {
        return envelope.data;
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
    },
  };
}
