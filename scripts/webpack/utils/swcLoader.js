const PARSERS = {
  ts: {syntax: 'typescript'},
  tsx: {syntax: 'typescript', tsx: true},
  js: {syntax: 'ecmascript', jsx: true}
}

// swc keeps the syntax that every supported browser & node has shipped since 2022 instead of transpiling it
// useDefineForClassFields is off because a field that is only declared for its type must not overwrite what the parent constructor set
// Only pass minify for files without dynamic imports, because minifying here strips the webpackChunkName comments
// rspack runs swc natively, so builtin skips handing every file to a JS loader & back
const swcLoader = ({
  extension,
  development = false,
  refresh = false,
  commonjs = false,
  builtin = false,
  minify
}) => ({
  loader: builtin ? 'builtin:swc-loader' : 'swc-loader',
  options: {
    swcrc: false,
    configFile: false,
    minify: !!minify,
    module: commonjs ? {type: 'commonjs'} : undefined,
    jsc: {
      parser: PARSERS[extension],
      target: 'es2022',
      transform: {
        react: {runtime: 'automatic', development, refresh},
        useDefineForClassFields: false
      },
      minify
    }
  }
})

module.exports = swcLoader
