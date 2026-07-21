/**
 * CDN / IIFE entry. Builds `formreach.min.js` with global `FormsReach`.
 */
import { init } from "./init";
import { submitForm } from "./client";

const FormsReach = {
  init,
  submitForm,
};

export default FormsReach;
