/**
 * Build a string-only payload from a form, inject api_key + honeypot.
 * File inputs are skipped (product API accepts string fields only).
 */
export function formToPayload(
  form: HTMLFormElement,
  apiKey: string,
): Record<string, string> {
  const fd = new FormData(form);
  const data: Record<string, string> = {};

  for (const [key, value] of fd.entries()) {
    if (typeof value === "string") {
      data[key] = value;
    }
  }

  data.api_key = apiKey;
  if (data._gotcha === undefined) {
    data._gotcha = "";
  }

  return data;
}

/** Ensure programmatic data has api_key and empty honeypot when missing. */
export function withSubmitMeta(
  data: Record<string, string>,
  apiKey: string,
): Record<string, string> {
  return {
    ...data,
    api_key: apiKey,
    _gotcha: data._gotcha ?? "",
  };
}
