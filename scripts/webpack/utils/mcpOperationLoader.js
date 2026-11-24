const fs = require('fs')
const path = require('path')
const getProjectRoot = require('./getProjectRoot')

const SERVER_ROOT = path.join(getProjectRoot(), 'packages', 'server')
const SCHEMA_PATH = path.join(SERVER_ROOT, 'graphql', 'public', 'schema.graphql')

require('sucrase/register')
const {buildSchema} = require(require.resolve('graphql', {paths: [SERVER_ROOT]}))
const {default: compileOperationTool} = require(
  path.join(SERVER_ROOT, 'mcp', 'compileOperationTool.ts')
)

let builtSchema = null

const getSchema = () => {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`${SCHEMA_PATH} is missing. Run pnpm relay:build`)
  }
  const {mtimeMs} = fs.statSync(SCHEMA_PATH)
  if (builtSchema?.mtimeMs !== mtimeMs) {
    builtSchema = {mtimeMs, schema: buildSchema(fs.readFileSync(SCHEMA_PATH, 'utf8'))}
  }
  return builtSchema.schema
}

function mcpOperationLoader(source) {
  this.addDependency(SCHEMA_PATH)
  const tool = compileOperationTool(getSchema(), source, path.basename(this.resourcePath))
  return `module.exports = ${JSON.stringify(tool)}`
}

module.exports = mcpOperationLoader
