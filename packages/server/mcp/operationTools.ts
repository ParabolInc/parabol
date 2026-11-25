import type OperationTool from './OperationTool'

const operations = require.context('./operations?mcp', false, /\.graphql$/)

const operationTools = operations
  .keys()
  .sort()
  .map((key): OperationTool => operations(key))

export default operationTools
