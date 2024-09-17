import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const moveReflectTemplatePrompt: MutationResolvers['moveReflectTemplatePrompt'] = async (
  _source,
  {promptId, sortOrder},
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

  // RESOLUTION
  const {teamId} = prompt
  await pg.updateTable('ReflectPrompt').set({sortOrder}).where('id', '=', promptId).execute()
  dataLoader.clearAll('reflectPrompts')
  const data = {promptId}
  publish(SubscriptionChannel.TEAM, teamId, 'MoveReflectTemplatePromptPayload', data, subOptions)
  return data
}

export default moveReflectTemplatePrompt
