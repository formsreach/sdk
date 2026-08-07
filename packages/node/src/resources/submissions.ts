import type { HttpClient } from "../http";
import type {
  AttachmentSignedUrl,
  ListSubmissionsOptions,
  Submission,
  SubmissionList,
} from "../types";

export class SubmissionsResource {
  constructor(private readonly http: HttpClient) {}

  list(
    formId: string,
    options: ListSubmissionsOptions = {},
  ): Promise<SubmissionList> {
    return this.http.request<SubmissionList>(
      "GET",
      `/api/v1/forms/${formId}/submissions`,
      {
        limit: options.limit,
        cursor: options.cursor,
        q: options.q,
        spam: options.spam,
      },
    );
  }

  get(formId: string, submissionId: string): Promise<Submission> {
    return this.http.request<Submission>(
      "GET",
      `/api/v1/forms/${formId}/submissions/${submissionId}`,
    );
  }

  export(formId: string): Promise<string> {
    return this.http.request<string>(
      "GET",
      `/api/v1/forms/${formId}/submissions/export`,
    );
  }

  getAttachmentUrl(
    formId: string,
    submissionId: string,
    attachmentId: string,
  ): Promise<AttachmentSignedUrl> {
    return this.http.request<AttachmentSignedUrl>(
      "GET",
      `/api/v1/forms/${formId}/submissions/${submissionId}/attachments/${attachmentId}/url`,
    );
  }
}
