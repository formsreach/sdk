import { useCallback, useRef, useState } from "react";
import {
  submitForm,
  FormsReachClientError,
  ensureSpamFields,
  type FormsReachError,
  type FormsReachSuccess,
} from "@formsreach/js";

export type UseFormsReachOptions = {
  apiKey: string;
  onSuccess?: (result: FormsReachSuccess) => void;
  onError?: (error: FormsReachError) => void;
};

export type UseFormsReachResult = {
  /** Attach to `<form onSubmit={submit}>`. */
  submit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
};

function formDataToRecord(form: HTMLFormElement): Record<string, string> {
  const fd = new FormData(form);
  const data: Record<string, string> = {};
  for (const [key, value] of fd.entries()) {
    if (typeof value === "string") data[key] = value;
  }
  return data;
}

/**
 * React / Next.js hook. Matches the FormsReach dashboard snippet API.
 *
 * Spam protection (`_gotcha` + `_ts`) is injected automatically on submit.
 *
 * @example
 * const { submit, submitting } = useFormsReach('fr_…');
 * <form onSubmit={submit}>…</form>
 */
export function useFormsReach(
  apiKeyOrOptions: string | UseFormsReachOptions,
): UseFormsReachResult {
  const options: UseFormsReachOptions =
    typeof apiKeyOrOptions === "string"
      ? { apiKey: apiKeyOrOptions }
      : apiKeyOrOptions;

  const { apiKey, onSuccess, onError } = options;
  const [submitting, setSubmitting] = useState(false);
  const mountTs = useRef(String(Date.now()));

  const submit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;

      const form = event.currentTarget;
      ensureSpamFields(form, { ts: mountTs.current });
      const data = formDataToRecord(form);

      setSubmitting(true);
      void submitForm({
        apiKey,
        data,
      })
        .then((result) => {
          onSuccess?.(result);
          if (result.redirectUrl) {
            window.location.assign(result.redirectUrl);
          }
        })
        .catch((e: unknown) => {
          const error =
            e instanceof FormsReachClientError
              ? e.formsreach
              : {
                  status: 0,
                  code: "unknown_error",
                  title: "Unknown error",
                  detail: e instanceof Error ? e.message : String(e),
                };
          onError?.(error);
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
    [apiKey, onSuccess, onError, submitting],
  );

  return { submit, submitting };
}
