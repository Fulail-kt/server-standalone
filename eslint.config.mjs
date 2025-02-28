// import globals from "globals";
// import pluginJs from "@eslint/js";
// import tseslint from "typescript-eslint";


// /** @type {import('eslint').Linter.Config[]} */
// export default [
//   {files: ["**/*.{js,mjs,cjs,ts}"]},
//   {languageOptions: { globals: globals.browser }},
//   pluginJs.configs.recommended,
//   ...tseslint.configs.recommended,
// ];

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"], // Lint all JavaScript and TypeScript files
    languageOptions: {
      globals: {
        ...globals.node, // Use Node.js globals
      },
      parserOptions: {
        ecmaVersion: 2021, // Use ES2021 features
        sourceType: "module", // Use ES modules
      },
    },
    rules: {
      // Add custom rules here
      "@typescript-eslint/no-unused-vars": "warn", // Warn on unused variables
      "@typescript-eslint/no-explicit-any": "warn", // Warn on `any` types
      "@typescript-eslint/explicit-function-return-type": "off", // Allow implicit return types
      "import/extensions": "off", // Disable extension requirement for imports
      "import/no-unresolved": "off", // Disable unresolved import errors (TypeScript handles this)
    },
  },
  pluginJs.configs.recommended, // Apply recommended ESLint rules
  ...tseslint.configs.recommended, // Apply recommended TypeScript ESLint rules
];