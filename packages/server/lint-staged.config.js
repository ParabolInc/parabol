module.exports = {
  // "*.{ts,tsx}": 'organize-imports-cli',
  '*.{js,ts,tsx}': 'eslint --fix',
  '*': () => 'tsc --noEmit -p tsconfig.json'
}
