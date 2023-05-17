const {process: upstreamProcess} = require('jest-transform-graphql')
// https://github.com/remind101/jest-transform-graphql/issues/13#issuecomment-1367564978

const process = (...args) => {
  const code = upstreamProcess(...args)
  return {code}
}

module.exports = {process}
