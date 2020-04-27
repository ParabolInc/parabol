const path = require('path')
const fs = require('fs')

const getProjectRoot = () => {
  let cd = __dirname
  while (cd !== '/') {
    const lockfilePath = path.join(cd, 'yarn.lock')
    if (fs.existsSync(lockfilePath)) return cd
    cd = path.join(cd, '..')
  }
}

module.exports = getProjectRoot
