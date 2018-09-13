import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError, sendTooManyPromptsError} from 'server/utils/authorizationErrors'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import dndNoise from 'universal/utils/dndNoise'
import AddReflectTemplatePromptPayload from '../types/AddReflectTemplatePromptPayload'
import {Prompt} from './helpers/makeRetroTemplates'

const addReflectTemplatePrompt = {
  description: 'Add a new template full of prompts',
  type: AddReflectTemplatePromptPayload,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve (_source, {templateId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const template = await r.table('ReflectTemplate').get(templateId)

    // AUTH
    if (!template || !isTeamMember(authToken, template.teamId) || !template.isActive) {
      return sendTeamAccessError(authToken, templateId)
    }

    // VALIDATION
    const {teamId} = template
    const activePrompts = await r
      .table('CustomPhaseItem')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        templateId,
        isActive: true
      })
    if (activePrompts.length >= 5) {
      return sendTooManyPromptsError(authToken, templateId)
    }

    // RESOLUTION
    const sortOrder = Math.max(...activePrompts.map((prompt) => prompt.sortOrder)) + 1 + dndNoise()
    const phaseItem = new Prompt(template, sortOrder, `New prompt #${activePrompts.length + 1}`)

    await r.table('CustomPhaseItem').insert(phaseItem)

    const promptId = phaseItem.id
    const data = {promptId}
    publish(TEAM, teamId, AddReflectTemplatePromptPayload, data, subOptions)
    return data
  }
}

export default addReflectTemplatePrompt
