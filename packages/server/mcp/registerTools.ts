import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js'
import type {ZodRawShapeCompat} from '@modelcontextprotocol/sdk/server/zod-compat.js'
import type {MCPTool} from './defineTool'
import type {MCPContext} from './MCPContext'
import describeType from './tools/describeType'
import graphqlMutate from './tools/graphqlMutate'
import graphqlQuery from './tools/graphqlQuery'
import searchSchema from './tools/searchSchema'

const registerTool = (
  server: McpServer,
  context: MCPContext,
  {name, title, description, inputSchema, annotations, run}: MCPTool<ZodRawShapeCompat>
) => {
  server.registerTool(name, {title, description, inputSchema, annotations}, (input) =>
    run(context, input)
  )
}

const registerTools = (server: McpServer, context: MCPContext) => {
  registerTool(server, context, graphqlQuery)
  registerTool(server, context, graphqlMutate)
  registerTool(server, context, searchSchema)
  registerTool(server, context, describeType)
}

export default registerTools
