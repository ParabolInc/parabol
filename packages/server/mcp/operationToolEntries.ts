import type {Tool} from '@modelcontextprotocol/sdk/types.js'
import type MCPToolEntry from './MCPToolEntry'
import operationTools from './operationTools'
import runGraphQL from './runGraphQL'
import toolResult from './toolResult'

const getDefaults = ({properties = {}}: Tool['inputSchema']) =>
  Object.fromEntries(
    Object.entries(properties).flatMap(([name, schema]) =>
      'default' in schema ? [[name, schema.default]] : []
    )
  )

const operationToolEntries: MCPToolEntry[] = operationTools.map(({document, ...definition}) => {
  const defaults = getDefaults(definition.inputSchema)
  return {
    definition,
    call: async (context, args) =>
      toolResult(await runGraphQL(context, document, {...defaults, ...args}))
  }
})

export default operationToolEntries
