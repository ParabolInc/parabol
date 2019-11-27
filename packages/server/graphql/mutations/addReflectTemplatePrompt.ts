import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import dndNoise from '../../../client/utils/dndNoise'
import standardError from '../../utils/standardError'
import AddReflectTemplatePromptPayload from '../types/AddReflectTemplatePromptPayload'
import {Prompt} from './helpers/makeRetroTemplates'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const addReflectTemplatePrompt = {
  description: 'Add a new template full of prompts',
  type: AddReflectTemplatePromptPayload,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {templateId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const template = await r
      .table('ReflectTemplate')
      .get(templateId)
      .run()
    const viewerId = getUserId(authToken)

    // AUTH
    if (!template || !isTeamMember(authToken, template.teamId) || !template.isActive) {
      return standardError(new Error('Team not found'), {userId: viewerId})
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
      .run()
    if (activePrompts.length >= 5) {
      return standardError(new Error('Too many prompts'), {userId: viewerId})
    }

    // RESOLUTION
    const sortOrder = Math.max(...activePrompts.map((prompt) => prompt.sortOrder)) + 1 + dndNoise()
    const phaseItem = new Prompt(template, sortOrder, `New prompt #${activePrompts.length + 1}`, '')

    await r
      .table('CustomPhaseItem')
      .insert(phaseItem)
      .run()

    const promptId = phaseItem.id
    const data = {promptId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddReflectTemplatePromptPayload', data, subOptions)
    return data
  }
}

export default addReflectTemplatePrompt
