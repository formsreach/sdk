import type { HttpClient } from "../http";
import type { Form, FormList } from "../types";

export class FormsResource {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<FormList> {
    return this.http.request<FormList>("GET", "/api/v1/forms");
  }

  get(formId: string): Promise<Form> {
    return this.http.request<Form>("GET", `/api/v1/forms/${formId}`);
  }
}
