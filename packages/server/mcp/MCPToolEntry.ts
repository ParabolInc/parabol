import type {CallToolResult, Tool} from '@modelcontextprotocol/sdk/types.js'
import type {MCPContext} from './MCPContext'

interface MCPToolEntry {
  definition: Tool
  call(context: MCPContext, args: Record<string, unknown>): Promise<CallToolResult>
}

export default MCPToolEntry
