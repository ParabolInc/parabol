import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const reflectTemplatePromptUpdateDescription: MutationResolvers['reflectTemplatePromptUpdateDescription'] =
  async (_source, {promptId, description}, {authToken, dataLoader, socketId: mutatorId}) => {
    const pg = getKysely()
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
    const {teamId} = prompt
    const normalizedDescription = description.trim().slice(0, 256) || ''

    // RESOLUTION
    await pg
      .updateTable('ReflectPrompt')
      .set({description: normalizedDescription})
      .where('id', '=', promptId)
      .execute()
    dataLoader.clearAll('reflectPrompts')
    const data = {promptId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'ReflectTemplatePromptUpdateDescriptionPayload',
      data,
      subOptions
    )
    return data
  }

export default reflectTemplatePromptUpdateDescription
