module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint'],
  parserOptions: {
    project: './tsconfig.base.json',
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    eqeqeq: 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
}
