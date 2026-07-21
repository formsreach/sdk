import { ref, type Ref } from "vue";
import {
  submitForm,
  FormsReachClientError,
  type FormsReachError,
  type FormsReachSuccess,
} from "@formsreach/js";

export type UseFormsReachOptions = {
  apiKey: string;
  endpoint?: string;
  onSuccess?: (result: FormsReachSuccess) => void;
  onError?: (error: FormsReachError) => void;
};

export type UseFormsReachResult = {
  /** Use with `@submit.prevent="submit"`. */
  submit: (event: Event) => void;
  submitting: Ref<boolean>;
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
 * Vue / Nuxt composable. Matches the FormsReach dashboard snippet API.
 */
export function useFormsReach(
  apiKeyOrOptions: string | UseFormsReachOptions,
): UseFormsReachResult {
  const options: UseFormsReachOptions =
    typeof apiKeyOrOptions === "string"
      ? { apiKey: apiKeyOrOptions }
      : apiKeyOrOptions;

  const submitting = ref(false);

  function submit(event: Event): void {
    event.preventDefault();
    if (submitting.value) return;

    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const data = formDataToRecord(form);
    submitting.value = true;

    void submitForm({
      apiKey: options.apiKey,
      endpoint: options.endpoint,
      data,
    })
      .then((result) => {
        options.onSuccess?.(result);
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
        options.onError?.(error);
      })
      .finally(() => {
        submitting.value = false;
      });
  }

  return { submit, submitting };
}
