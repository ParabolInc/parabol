const cp = require('child_process')

const getCommitHash = () => cp.execSync('git rev-parse HEAD').toString().trim()

module.exports = getCommitHash
