const path = require('path')
const fs = require('fs')

// This helper function is a last resort to determine the absolute file path of the app
// It's used in preDeploy when the location of the calling function is non-deterministic
// E.g. the caller lives in /scripts for local dev and /dist for prod

const getProjectRoot = () => {
  let cd = __dirname
  while (cd !== '/') {
    const lockfilePath = path.join(cd, 'pnpm-lock.yaml')
    if (fs.existsSync(lockfilePath)) return cd
    cd = path.join(cd, '..')
  }
}

module.exports = getProjectRoot
