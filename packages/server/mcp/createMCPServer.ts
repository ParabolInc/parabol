import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import packageJSON from '../package.json'
import type {MCPToolset} from './getMCPToolset'
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
import describeGraphql from './tools/describeGraphql'
import endMeeting from './tools/endMeeting'
import graphqlMutate from './tools/graphqlMutate'
import graphqlQuery from './tools/graphqlQuery'
import listTemplates from './tools/listTemplates'
import updateReflection from './tools/updateReflection'
import updateTask from './tools/updateTask'
import uploadImage from './tools/uploadImage'
import votePokerStory from './tools/votePokerStory'
import withoutSentencesNaming from './withoutSentencesNaming'

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
  endMeeting,
  addComment,
  uploadImage,
  describeGraphql,
  graphqlQuery,
  graphqlMutate
]

const allTools = [...operationToolEntries, ...typescriptTools]

const GENERIC_TOOL_NAMES = [graphqlQuery, graphqlMutate, describeGraphql].map(
  ({definition}) => definition.name
)

const curatedTools: MCPToolEntry[] = allTools
  .filter(({definition}) => !GENERIC_TOOL_NAMES.includes(definition.name))
  .map((entry) => ({
    ...entry,
    definition: {
      ...entry.definition,
      description:
        entry.definition.description &&
        withoutSentencesNaming(entry.definition.description, GENERIC_TOOL_NAMES)
    }
  }))

const TOOLSETS = {
  all: {tools: allTools, instructions: mcpInstructions},
  curated: {
    tools: curatedTools,
    instructions: withoutSentencesNaming(mcpInstructions, GENERIC_TOOL_NAMES)
  }
} satisfies Record<MCPToolset, {tools: MCPToolEntry[]; instructions: string}>

const createMCPServer = (context: MCPContext, toolset: MCPToolset) => {
  const {tools, instructions} = TOOLSETS[toolset]
  const server = new Server(
    {name: 'parabol', version: packageJSON.version},
    {capabilities: {tools: {}}, instructions}
  )
  registerTools(server, context, tools)
  return server
}

export default createMCPServer
