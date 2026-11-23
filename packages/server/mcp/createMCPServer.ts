import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js'
import packageJSON from '../package.json'
import type {MCPContext} from './MCPContext'
import mcpInstructions from './mcpInstructions'
import registerTools from './registerTools'

const createMCPServer = (context: MCPContext) => {
  const server = new McpServer(
    {name: 'parabol', version: packageJSON.version},
    {instructions: mcpInstructions}
  )
  registerTools(server, context)
  return server
}

export default createMCPServer
