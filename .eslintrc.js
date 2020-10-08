module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks"
  ],
  env: {
    es6: true,
    browser: true,
    node: true
  },
  ignorePatterns: [
    "/**/*.*", // Ignore all first
    "!/src/**/*.ts", // Add back .ts files
    "!/src/**/*.tsx" // Add back .tsx files
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  rules: {
    semi: "error",
    "react-hooks/exhaustive-deps": ["warn", { additionalHooks: "useMemoizeOne" }],
    "@typescript-eslint/no-shadow": ["error"],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};
