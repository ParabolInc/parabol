import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js'
import type {ZodRawShapeCompat} from '@modelcontextprotocol/sdk/server/zod-compat.js'
import {Logger} from '../utils/Logger'
import type {MCPTool} from './defineTool'
import type {MCPContext} from './MCPContext'
import createPage from './tools/createPage'
import createTask from './tools/createTask'
import describeType from './tools/describeType'
import editPage from './tools/editPage'
import getMe from './tools/getMe'
import getMeeting from './tools/getMeeting'
import graphqlMutate from './tools/graphqlMutate'
import graphqlQuery from './tools/graphqlQuery'
import listMeetings from './tools/listMeetings'
import listTasks from './tools/listTasks'
import readPage from './tools/readPage'
import searchPages from './tools/searchPages'
import searchSchema from './tools/searchSchema'
import startMeeting from './tools/startMeeting'
import updateTask from './tools/updateTask'
import uploadImage from './tools/uploadImage'

const registerTool = (
  server: McpServer,
  context: MCPContext,
  {name, title, description, inputSchema, annotations, run}: MCPTool<ZodRawShapeCompat>
) => {
  server.registerTool(name, {title, description, inputSchema, annotations}, async (input) => {
    const startedAt = performance.now()
    try {
      return await run(context, input)
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

const registerTools = (server: McpServer, context: MCPContext) => {
  registerTool(server, context, getMe)
  registerTool(server, context, listMeetings)
  registerTool(server, context, getMeeting)
  registerTool(server, context, startMeeting)
  registerTool(server, context, listTasks)
  registerTool(server, context, createTask)
  registerTool(server, context, updateTask)
  registerTool(server, context, searchPages)
  registerTool(server, context, readPage)
  registerTool(server, context, createPage)
  registerTool(server, context, editPage)
  registerTool(server, context, uploadImage)
  registerTool(server, context, graphqlQuery)
  registerTool(server, context, graphqlMutate)
  registerTool(server, context, searchSchema)
  registerTool(server, context, describeType)
}

export default registerTools
