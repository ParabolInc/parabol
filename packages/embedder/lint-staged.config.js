module.exports = {
  '*.{ts,tsx,graphql}': ['biome check --write '],
  '**/*.{ts,tsx}': () => 'tsc --noEmit -p tsconfig.json'
}
