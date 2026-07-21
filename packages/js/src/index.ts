export { init } from "./init";
export { submitForm, FormsReachClientError } from "./client";
export {
  DEFAULT_ENDPOINT,
  FORM_ATTR,
  EVENT_SUCCESS,
  EVENT_ERROR,
  type FormsReachInitOptions,
  type FormsReachSuccess,
  type FormsReachError,
  type SubmitFormOptions,
} from "./types";

import { init } from "./init";
import { submitForm } from "./client";

/** Namespace object for ESM consumers: `import { FormsReach } from '@formsreach/js'`. */
export const FormsReach = {
  init,
  submitForm,
};

export default FormsReach;
