module.exports = {
  'package/client/**/!(*graphql).{js,ts,tsx}': 'eslint --fix',
  '**/*.{ts,tsx}': () => 'tsc --noEmit -p tsconfig.json'
}
