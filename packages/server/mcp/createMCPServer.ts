import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js'
import packageJSON from '../package.json'
import type {MCPContext} from './MCPContext'
import mcpInstructions from './mcpInstructions'

const createMCPServer = (_context: MCPContext) =>
  new McpServer({name: 'parabol', version: packageJSON.version}, {instructions: mcpInstructions})

export default createMCPServer
