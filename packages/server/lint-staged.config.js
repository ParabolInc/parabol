module.exports = {
  '*.{ts,tsx,graphql}': () => 'biome check --write --staged',
  '**/*.{ts,tsx}': () => 'tsc --noEmit -p tsconfig.json'
}
