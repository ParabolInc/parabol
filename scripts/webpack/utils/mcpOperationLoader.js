const fs = require('fs')
const path = require('path')
const getProjectRoot = require('./getProjectRoot')

const SERVER_ROOT = path.join(getProjectRoot(), 'packages', 'server')
const SCHEMA_PATH = path.join(SERVER_ROOT, 'graphql', 'public', 'schema.graphql')
const MCP_ROOT = path.join(SERVER_ROOT, 'mcp')
const COMPILER_PATHS = [
  'compileOperationTool.ts',
  'getLeadingComment.ts',
  'getVariableSchema.ts',
  'toolAnnotations.ts',
  'OperationTool.ts'
].map((fileName) => path.join(MCP_ROOT, fileName))

require('sucrase/dist/register').registerTS()
const {buildSchema} = require(require.resolve('graphql', {paths: [SERVER_ROOT]}))
const {default: compileOperationTool} = require(path.join(MCP_ROOT, 'compileOperationTool.ts'))

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
  COMPILER_PATHS.forEach((compilerPath) => this.addDependency(compilerPath))
  const tool = compileOperationTool(getSchema(), source, path.basename(this.resourcePath))
  return `module.exports = ${JSON.stringify(tool)}`
}

module.exports = mcpOperationLoader
