module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --config ../../.prettierrc --ignore-path ./.eslintignore --write'],
  '*.graphql': ['prettier --config ../../.prettierrc --ignore-path ./.eslintignore --write'],
  '**/*.{ts,tsx}': () => 'tsc --noEmit -p tsconfig.json'
}
