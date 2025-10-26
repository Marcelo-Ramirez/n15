// .eslintrc.js (o el nombre de tu archivo de configuración de ESLint)

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "tailwind.config.js",
      "postcss.config.js",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"], 
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "varsIgnorePattern": "^_",
          "argsIgnorePattern": "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.config.js", "**/*.config.cjs"], 
    languageOptions: {
      globals: {
        require: "readonly", 
        module: "writable",
        exports: "writable",
      },
    },
    rules: {
      "import/no-commonjs": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
      "import/extensions": "off", 
    }
  },

];

export default eslintConfig;