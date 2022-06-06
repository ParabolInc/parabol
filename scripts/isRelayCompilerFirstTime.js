const fs = require('fs')
const path = require('path')

const isRelayCompilerFirstTime = () => {
  return !fs.existsSync(path.join(__dirname, '../packages/client/__generated__'))
}

module.exports = isRelayCompilerFirstTime
