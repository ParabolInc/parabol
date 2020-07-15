module.exports = {
  'package/client/**/!(*graphql).{js,ts,tsx}': 'eslint --fix',
  'package/client/**/!(*grphql).{ts,tsx}': () => 'tsc --noEmit -p tsconfig.json'
}
