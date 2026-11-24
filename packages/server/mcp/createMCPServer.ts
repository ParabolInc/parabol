import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import packageJSON from '../package.json'
import type {MCPContext} from './MCPContext'
import type MCPToolEntry from './MCPToolEntry'
import mcpInstructions from './mcpInstructions'
import operationTools from './operationTools'
import registerTools from './registerTools'
import runGraphQL from './runGraphQL'
import toolResult from './toolResult'

const toolEntries: MCPToolEntry[] = operationTools.map(({document, ...definition}) => ({
  definition,
  call: async (context, args) => toolResult(await runGraphQL(context, document, args))
}))

const createMCPServer = (context: MCPContext) => {
  const server = new Server(
    {name: 'parabol', version: packageJSON.version},
    {capabilities: {tools: {}}, instructions: mcpInstructions}
  )
  registerTools(server, context, toolEntries)
  return server
}

export default createMCPServer
