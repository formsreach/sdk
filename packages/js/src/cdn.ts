/**
 * CDN / IIFE entry. Builds `formsreach.min.js` with global `FormsReach`.
 */
import { init } from "./init";
import { submitForm } from "./client";

const FormsReach = {
  init,
  submitForm,
};

export default FormsReach;
