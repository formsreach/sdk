/** Fixed management API origin. Internal — not a public configuration option. */
export const API_BASE = "https://app.formsreach.com";

export type FormsReachOptions = {
  /** Developer API key (Bearer). Requires forms:read and submissions:read for v1. */
  apiKey: string;
};

export type FormsReachError = {
  type?: string;
  title: string;
  status: number;
  code: string;
  detail?: string;
  errors?: Array<{ path: string; message: string }>;
  requestId?: string;
};

export type FormFieldType =
  | "text"
  | "email"
  | "textarea"
  | "phone"
  | "number"
  | "url"
  | "date"
  | "file"
  | "radio";

export type FormField = {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type FormTheme = {
  version: 1;
  preset?: "dark" | "light" | "soft";
  background: string;
  text: string;
  primary: string;
  primaryForeground: string;
  inputBackground: string;
  fontFamily: "inter" | "system" | "serif" | "mono";
  radius: "sm" | "md" | "lg";
  showTitle: boolean;
};

export type FormSummary = {
  id: string;
  name: string;
  description: string | null;
  source: string | null;
  isActive: boolean;
  apiKeyPrefix: string;
  allowedDomains: string[];
  enableApi: boolean;
  enableEmbed: boolean;
  enableThirdParty: boolean;
  publicSubmitUrl: string;
  publicFormUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type Form = FormSummary & {
  redirectEnabled: boolean;
  redirectUrl: string | null;
  apiKey: string;
  fields: FormField[];
  theme: FormTheme;
};

export type FormList = {
  items: FormSummary[];
};

export type SpamReason = "honeypot" | "time_trap";

export type Submission = {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  createdAt: string;
  isSpam: boolean;
  spamReason: SpamReason | null;
};

export type SubmissionList = {
  items: Submission[];
  nextCursor: string | null;
};

export type ListSubmissionsOptions = {
  limit?: number;
  cursor?: string;
  q?: string;
  spam?: boolean;
};

export type AttachmentSignedUrl = {
  url: string;
  expiresIn: number;
};
