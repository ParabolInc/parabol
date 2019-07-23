const path = require('path')

module.exports = {
  alias: {
    // example of how to alias
    // 'relay-runtime': '@mattkrick/relay-runtime'
  },
  modules: [path.join(__dirname, '../packages'), 'node_modules'],
  extensions: ['.wasm', '.mjs', '.js', '.json', '.ts', '.tsx', '.graphql', '.d.ts']
}
