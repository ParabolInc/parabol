import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getSortOrder} from '../../../../client/shared/sortOrder'
import getRethink from '../../../database/rethinkDriver'
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

  // RESOLUTION
  const {teamId} = prompt

  const oldPrompts = await dataLoader.get('reflectPromptsByTemplateId').load(prompt.templateId)
  const fromIdx = oldPrompts.findIndex((p) => p.id === promptId)

  await Promise.all([
    r
      .table('ReflectPrompt')
      .get(promptId)
      .update({
        sortOrder,
        updatedAt: now
      })
      .run()
  ])
  dataLoader.clearAll('reflectPrompts')
  const newPrompts = await dataLoader.get('reflectPromptsByTemplateId').load(prompt.templateId)
  const pgPrompts = await dataLoader.get('_pgreflectPromptsByTemplateId').load(prompt.templateId)
  const toIdx = newPrompts.findIndex((p) => p.id === promptId)
  const pgSortOrder = getSortOrder(pgPrompts, fromIdx, toIdx)
  await pg
    .updateTable('ReflectPrompt')
    .set({sortOrder: pgSortOrder})
    .where('id', '=', promptId)
    .execute()
  const data = {promptId}
  publish(SubscriptionChannel.TEAM, teamId, 'MoveReflectTemplatePromptPayload', data, subOptions)
  return data
}

export default moveReflectTemplatePrompt
