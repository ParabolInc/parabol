module.exports = {
  '*.{js,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*': () => 'tsc --noEmit -p tsconfig.json'
}
