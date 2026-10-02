// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'import'],
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  ignorePatterns: ['/dist/*', '/public/*', '/babel-plugins/*'],
  env: {
    browser: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-var-requires": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-wrapper-object-types": "off",
    "@typescript-eslint/ban-tslint-comment": "off",
    "react/no-unescaped-entities": "off",
    "import/no-unresolved": "error",
    "prefer-const": "off",
    "react/prop-types": 1,
    "no-case-declarations": "off",
    "no-empty": "off",
    "react/display-name": "off",
    "no-var": "off"
  },
  overrides: [
    {
      // Plain Node/CommonJS files (not bundled by Metro) -- require()/__dirname/etc. are
      // expected here, unlike the rest of the app's ES module source.
      files: ['metro.config.js', 'scripts/**/*.js', 'jest.setup.js'],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off'
      }
    },
    {
      // Jest specs and mocks: jest/describe/it/expect globals, plus the
      // require() factory form jest.mock(() => require(...)) needs.
      files: ['**/__tests__/**/*.ts', '__mocks__/**/*.ts', 'jest.setup.js'],
      env: {
        node: true,
        jest: true
      },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'import/first': 'off'
      }
    }
  ]
};
