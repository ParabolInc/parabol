module.exports = {
  '*.{ts,tsx,graphql}': () => 'biome check --write --staged',
  '**/*.{ts,tsx}': () => 'tsgo --noEmit -p tsconfig.json'
}
