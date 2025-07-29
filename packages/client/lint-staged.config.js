module.exports = {
  '**/*.{ts,tsx}': () => 'tsc --noEmit -p tsconfig.json'
}
