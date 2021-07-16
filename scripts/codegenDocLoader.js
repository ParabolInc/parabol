const {parse} = require('graphql')
const {readFileSync} = require('fs')

// unprefix the githubQueries (like getRepositories.graphql) to generate semi-acceptable types
module.exports = function(docString) {
  console.log('docString', docString)
  const str = readFileSync(docString, {encoding: 'utf-8'})
  const unprefixed = str.replace(/_xGitHub/g, '')
  return parse(unprefixed)
}
