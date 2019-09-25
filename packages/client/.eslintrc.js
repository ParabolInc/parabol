module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'emotion', 'react', 'react-hooks'],
  extends: ['plugin:react/recommended', '../../.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'react/no-find-dom-node': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'emotion/jsx-import': 'error',
    'emotion/no-vanilla': 'error',
    'emotion/import-from-emotion': 'error',
    'emotion/styled-import': 'error',
    // "react-hooks/exhaustive-deps": "error", // Checks effect dependencies, buggy so don't use with --fix
    'react-hooks/rules-of-hooks': 'warn' // Checks rules of Hooks
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
