import type {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError
} from '@modelcontextprotocol/sdk/types.js'
import {Logger} from '../utils/Logger'
import type {MCPContext} from './MCPContext'
import type MCPToolEntry from './MCPToolEntry'
import toolError from './toolError'

const registerTools = (server: Server, context: MCPContext, entries: MCPToolEntry[]) => {
  const entriesByName = new Map(entries.map((entry) => [entry.definition.name, entry]))
  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: entries.map(({definition}) => definition)
  }))
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const {name} = request.params
    const entry = entriesByName.get(name)
    if (!entry) throw new McpError(ErrorCode.InvalidParams, `Unknown tool: ${name}`)
    const startedAt = performance.now()
    try {
      return await entry.call(context, request.params.arguments ?? {})
    } catch (error) {
      Logger.error(error, {tags: {tool: name}, userId: context.grant.userId})
      return toolError(
        error instanceof Error ? error.message : String(error),
        'INTERNAL_SERVER_ERROR'
      )
    } finally {
      Logger.log('mcp tool', {
        tags: {
          tool: name,
          clientId: context.grant.clientId ?? 'pat',
          durationMs: Math.round(performance.now() - startedAt)
        },
        userId: context.grant.userId
      })
    }
  })
}

export default registerTools
