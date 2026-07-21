import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2020",
    treeshake: true,
  },
  {
    entry: { "formsreach.min": "src/cdn.ts" },
    format: ["iife"],
    globalName: "FormsReach",
    minify: true,
    sourcemap: false,
    clean: false,
    target: "es2020",
    outExtension: () => ({ js: ".js" }),
    // tsup IIFE wraps the export; cdn.ts assigns to globalThis.FormsReach
    // and re-exports the API object as default for the IIFE binding.
    esbuildOptions(options) {
      options.footer = {
        js: "typeof FormsReach !== 'undefined' && FormsReach.default && (FormsReach = FormsReach.default);",
      };
    },
  },
]);
