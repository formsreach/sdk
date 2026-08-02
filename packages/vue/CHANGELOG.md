# @formsreach/vue

## 0.3.0

### Minor Changes

- 452f069: Bake the submit endpoint into the SDK and stop exposing it

  All requests now go to `https://app.formsreach.com/api/v1/submit`, which is fixed inside `@formsreach/js`.

  **Breaking:**

  - Removed the `endpoint` option from `FormsReach.init`, `submitForm`, and `useFormsReach` (React and Vue).
  - Removed the `DEFAULT_ENDPOINT` export from `@formsreach/js`.

### Patch Changes

- Updated dependencies [452f069]
  - @formsreach/js@0.3.0

## 0.2.0

### Minor Changes

- 2820d75: Auto-inject honeypot (`_gotcha`) and time-trap (`_ts`) for CDN and framework submits. Export `ensureSpamFields`. Programmatic `submitForm` still skips inventing `_ts`.

### Patch Changes

- Updated dependencies [2820d75]
  - @formsreach/js@0.2.0

## 0.1.2

### Patch Changes

- a727674: Verify automated Version Packages PR creation after Actions permission updates.
- Updated dependencies [a727674]
  - @formsreach/js@0.1.2

## 0.1.1

### Patch Changes

- e8db636: Rename CDN bundle to formsreach.min.js (unpkg/jsDelivr path).
- Updated dependencies [e8db636]
  - @formsreach/js@0.1.1
