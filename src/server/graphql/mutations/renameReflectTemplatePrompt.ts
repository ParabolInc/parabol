import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import {
  sendTeamAccessError,
  sendDuplciateQuestionTemplatePromptError
} from 'server/utils/authorizationErrors'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import RenameReflectTemplatePromptPayload from '../types/RenameReflectTemplatePromptPayload'

const renameReflectTemplate = {
  description: 'Rename a reflect template',
  type: RenameReflectTemplatePromptPayload,
  args: {
    promptId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    question: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve (_source, {promptId, question}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const prompt = await r.table('CustomPhaseItem').get(promptId)

    // AUTH
    if (!prompt || !isTeamMember(authToken, prompt.teamId) || !prompt.isActive) {
      return sendTeamAccessError(authToken, prompt && prompt.teamId)
    }

    // VALIDATION
    const {teamId, templateId} = prompt
    const trimmedQuestion = question.trim().slice(0, 100)
    const normalizedQuestion = trimmedQuestion || 'Unnamed Prompt'

    const allPrompts = await r
      .table('CustomPhaseItem')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        isActive: true,
        templateId
      })
    if (allPrompts.find((prompt) => prompt.question === normalizedQuestion)) {
      return sendDuplciateQuestionTemplatePromptError(authToken, templateId)
    }

    // RESOLUTION
    await r
      .table('CustomPhaseItem')
      .get(promptId)
      .update({
        question: normalizedQuestion,
        updatedAt: now
      })

    const data = {promptId}
    publish(TEAM, teamId, RenameReflectTemplatePromptPayload, data, subOptions)
    return data
  }
}

export default renameReflectTemplate
