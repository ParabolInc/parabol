import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RemoveReflectTemplatePromptPayload from '../types/RemoveReflectTemplatePromptPayload'

const removeReflectTemplatePrompt = {
  description: 'Remove a prompt from a template',
  type: RemoveReflectTemplatePromptPayload,
  args: {
    promptId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {promptId}: {promptId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const pg = getKysely()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const prompt = await dataLoader.get('reflectPrompts').load(promptId)
    const viewerId = getUserId(authToken)

    // AUTH
    if (!prompt || prompt.removedAt) {
      return standardError(new Error('Prompt not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, prompt.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId, templateId} = prompt
    const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
    const activePrompts = prompts.filter((p) => !p.removedAt)
    const promptCount = activePrompts.length

    if (promptCount <= 1) {
      return standardError(new Error('No prompts remain'), {userId: viewerId})
    }

    // RESOLUTION
    await Promise.all([
      r
        .table('ReflectPrompt')
        .get(promptId)
        .update({
          removedAt: now,
          updatedAt: now
        })
        .run(),
      pg.updateTable('ReflectPrompt').set({removedAt: now}).where('id', '=', promptId).execute()
    ])
    dataLoader.clearAll('reflectPrompts')
    const data = {promptId, templateId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'RemoveReflectTemplatePromptPayload',
      data,
      subOptions
    )
    return data
  }
}

export default removeReflectTemplatePrompt
