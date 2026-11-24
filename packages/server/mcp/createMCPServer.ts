import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import type {Tool} from '@modelcontextprotocol/sdk/types.js'
import packageJSON from '../package.json'
import type {MCPContext} from './MCPContext'
import type MCPToolEntry from './MCPToolEntry'
import mcpInstructions from './mcpInstructions'
import operationTools from './operationTools'
import registerTools from './registerTools'
import runGraphQL from './runGraphQL'
import toolResult from './toolResult'

const getDefaults = ({properties = {}}: Tool['inputSchema']) =>
  Object.fromEntries(
    Object.entries(properties).flatMap(([name, schema]) =>
      'default' in schema ? [[name, schema.default]] : []
    )
  )

const toolEntries: MCPToolEntry[] = operationTools.map(({document, ...definition}) => {
  const defaults = getDefaults(definition.inputSchema)
  return {
    definition,
    call: async (context, args) =>
      toolResult(await runGraphQL(context, document, {...defaults, ...args}))
  }
})

const createMCPServer = (context: MCPContext) => {
  const server = new Server(
    {name: 'parabol', version: packageJSON.version},
    {capabilities: {tools: {}}, instructions: mcpInstructions}
  )
  registerTools(server, context, toolEntries)
  return server
}

export default createMCPServer
