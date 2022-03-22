module.exports = {
  '*.{js,ts,tsx}': 'eslint --fix',
  '*': () => 'tsc --noEmit -p tsconfig.json'
}
