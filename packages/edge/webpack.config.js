module.exports = {
  target: 'webworker',
  entry: './index.js',
  externals: [{'cross-fetch': 'fetch'}]
}
