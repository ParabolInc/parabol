import type {ShapeOutput, ZodRawShapeCompat} from '@modelcontextprotocol/sdk/server/zod-compat.js'
import type {CallToolResult, ToolAnnotations} from '@modelcontextprotocol/sdk/types.js'
import type {MCPContext} from './MCPContext'

export interface MCPTool<InputShape extends ZodRawShapeCompat> {
  name: string
  title: string
  description: string
  inputSchema: InputShape
  annotations: ToolAnnotations
  run(context: MCPContext, input: ShapeOutput<InputShape>): CallToolResult | Promise<CallToolResult>
}

const defineTool = <InputShape extends ZodRawShapeCompat>(tool: MCPTool<InputShape>) => tool

export default defineTool
