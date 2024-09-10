import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const removeReflectTemplatePrompt: MutationResolvers['removeReflectTemplatePrompt'] = async (
  _source,
  {promptId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
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
  const {teamId, templateId} = prompt
  const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
  const activePrompts = prompts.filter((p) => !p.removedAt)
  const promptCount = activePrompts.length

  if (promptCount <= 1) {
    return standardError(new Error('No prompts remain'), {userId: viewerId})
  }

  // RESOLUTION
  await pg
    .updateTable('ReflectPrompt')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('id', '=', promptId)
    .execute()
  dataLoader.clearAll('reflectPrompts')
  const data = {promptId, templateId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveReflectTemplatePromptPayload', data, subOptions)
  return data
}

export default removeReflectTemplatePrompt
