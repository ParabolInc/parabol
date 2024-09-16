import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const renameReflectTemplatePrompt: MutationResolvers['renameReflectTemplatePrompt'] = async (
  _source,
  {promptId, question},
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
  const trimmedQuestion = question.trim().slice(0, 100)
  const normalizedQuestion = trimmedQuestion || 'Unnamed Prompt'

  const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
  const allPrompts = prompts.filter(({removedAt}) => !removedAt)
  if (allPrompts.find((prompt) => prompt.question === normalizedQuestion)) {
    return standardError(new Error('Duplicate question template'), {userId: viewerId})
  }

  // RESOLUTION
  await pg
    .updateTable('ReflectPrompt')
    .set({question: normalizedQuestion})
    .where('id', '=', promptId)
    .execute()
  dataLoader.clearAll('reflectPrompts')
  const data = {promptId}
  publish(SubscriptionChannel.TEAM, teamId, 'RenameReflectTemplatePromptPayload', data, subOptions)
  return data
}

export default renameReflectTemplatePrompt
