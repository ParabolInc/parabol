module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'emotion', 'react'],
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint'
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'space-before-function-paren': ['error', 'always'], // remove when done refactoring
    ' react/no-find-dom-node': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'emotion/jsx-import': 'error',
    'emotion/no-vanilla': 'error',
    'emotion/import-from-emotion': 'error',
    'emotion/styled-import': 'error',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
