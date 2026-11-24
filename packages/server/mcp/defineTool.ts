import type {CallToolResult, ToolAnnotations} from '@modelcontextprotocol/sdk/types.js'
import {z} from 'zod'
import type {MCPContext} from './MCPContext'
import type MCPToolEntry from './MCPToolEntry'
import {textResult} from './toolResult'

interface ToolConfig<Input extends z.ZodObject> {
  name: string
  title: string
  description: string
  inputSchema: Input
  annotations: ToolAnnotations
  run(context: MCPContext, input: z.output<Input>): Promise<CallToolResult>
}

const defineTool = <Input extends z.ZodObject>({
  name,
  title,
  description,
  inputSchema,
  annotations,
  run
}: ToolConfig<Input>): MCPToolEntry => ({
  definition: {
    name,
    title,
    description,
    annotations,
    inputSchema: z.toJSONSchema(inputSchema) as MCPToolEntry['definition']['inputSchema']
  },
  call: async (context, args) => {
    const parsed = inputSchema.safeParse(args)
    if (!parsed.success) return textResult(z.prettifyError(parsed.error), true)
    return run(context, parsed.data)
  }
})

export default defineTool
