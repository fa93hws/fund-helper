module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "babel", "jest"],
  extends: [
    "airbnb-base",
    "eslint-config-prettier",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    "import/extensions": "off",
    "import/no-default-export": "error",
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": "off",

    "jest/no-test-callback": "off",

    "no-useless-constructor": "off",
    "no-unused-expressions": "off",
    "no-console": "error",
    "class-methods-use-this": "off",
    "no-continue": "off",
    "max-classes-per-file": "off",
    "no-restricted-syntax": "off",
  },
};
