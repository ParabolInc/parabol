import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import packageJSON from '../package.json'
import type {MCPContext} from './MCPContext'
import type MCPToolEntry from './MCPToolEntry'
import mcpInstructions from './mcpInstructions'
import operationToolEntries from './operationToolEntries'
import registerTools from './registerTools'
import addComment from './tools/addComment'
import addPokerStories from './tools/addPokerStories'
import addReflection from './tools/addReflection'
import answerStandup from './tools/answerStandup'
import answerTeamHealth from './tools/answerTeamHealth'
import createRetroTemplate from './tools/createRetroTemplate'
import createStandupTemplate from './tools/createStandupTemplate'
import createTask from './tools/createTask'
import createTeamHealthTemplate from './tools/createTeamHealthTemplate'
import deleteTemplate from './tools/deleteTemplate'
import describeGraphql from './tools/describeGraphql'
import endMeeting from './tools/endMeeting'
import graphqlMutate from './tools/graphqlMutate'
import graphqlQuery from './tools/graphqlQuery'
import listTemplates from './tools/listTemplates'
import updateReflection from './tools/updateReflection'
import updateTask from './tools/updateTask'
import uploadImage from './tools/uploadImage'
import votePokerStory from './tools/votePokerStory'

const typescriptTools: MCPToolEntry[] = [
  createTask,
  updateTask,
  addReflection,
  updateReflection,
  createRetroTemplate,
  createStandupTemplate,
  answerStandup,
  createTeamHealthTemplate,
  answerTeamHealth,
  addPokerStories,
  votePokerStory,
  listTemplates,
  deleteTemplate,
  endMeeting,
  addComment,
  uploadImage,
  describeGraphql,
  graphqlQuery,
  graphqlMutate
]

const createMCPServer = (context: MCPContext) => {
  const server = new Server(
    {name: 'parabol', version: packageJSON.version},
    {capabilities: {tools: {}}, instructions: mcpInstructions}
  )
  registerTools(server, context, [...operationToolEntries, ...typescriptTools])
  return server
}

export default createMCPServer
