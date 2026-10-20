import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["node_modules", "dist", "storybook-static"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  storybook.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error", // Ensure `import type` is used when it's necessary
      "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
    },
  }
);
