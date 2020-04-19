const path = require('path')

const PROJECT_ROOT = path.join(__dirname, '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client', 'src')

const relayPlugin = [
  'macros',
  {
    relay: {
      artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
    }
  }
]
module.exports = relayPlugin
