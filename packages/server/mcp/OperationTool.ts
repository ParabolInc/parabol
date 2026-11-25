import type {Tool, ToolAnnotations} from '@modelcontextprotocol/sdk/types.js'

interface OperationTool {
  name: string
  title: string
  description: string
  inputSchema: Tool['inputSchema']
  annotations: ToolAnnotations
  document: string
}

export default OperationTool
