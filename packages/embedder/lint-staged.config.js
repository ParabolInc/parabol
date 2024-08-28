module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --config ../../.prettierrc --ignore-path ./.prettierignore --write'
  ],
  '*.graphql': ['prettier --config ../../.prettierrc --ignore-path ./.prettierignore --write'],
  '**/*.{ts,tsx}': () => 'tsc --noEmit -p tsconfig.json'
}
