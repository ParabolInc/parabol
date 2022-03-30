module.exports = {
  'package/client/**/!(*graphql).{js,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '**/*.{ts,tsx}': () => 'tsc --noEmit -p tsconfig.json'
}
