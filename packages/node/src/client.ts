import { FormsReachClientError } from "./errors";
import { createHttp } from "./http";
import { FormsResource } from "./resources/forms";
import { SubmissionsResource } from "./resources/submissions";
import type { FormsReachOptions } from "./types";

export class FormsReach {
  readonly forms: FormsResource;
  readonly submissions: SubmissionsResource;

  constructor(options: FormsReachOptions) {
    const apiKey = options.apiKey?.trim() ?? "";
    if (!apiKey) {
      throw new FormsReachClientError({
        status: 0,
        code: "invalid_api_key",
        title: "Invalid API key",
        detail: "apiKey must be a non-empty string.",
      });
    }
    const http = createHttp(apiKey);
    this.forms = new FormsResource(http);
    this.submissions = new SubmissionsResource(http);
  }
}
