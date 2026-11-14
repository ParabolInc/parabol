import {isNotNull} from 'parabol-client/utils/predicates'
import {getTagsFromTipTapTask} from '../../../../client/shared/tiptap/getTagsFromTipTapTask'
import {plaintextToTipTap} from '../../../../client/shared/tiptap/plaintextToTipTap'
import dndNoise from '../../../../client/utils/dndNoise'
import generateUID from '../../../generateUID'
import {getServerIntegration} from '../../../integrations/platform/registry'
import type {IntegrationCtx} from '../../../integrations/platform/ServerIntegrationDefinition'
import getKysely from '../../../postgres/getKysely'
import {selectTasks} from '../../../postgres/select'
import logError from '../../../utils/logError'
import isValid from '../../isValid'
import type {UpdatePokerScopeItemInput} from '../../public/resolverTypes'

const parseIntegration = (ctx: IntegrationCtx, update: UpdatePokerScopeItemInput) => {
  const {service, serviceTaskId} = update
  const issueParts =
    getServerIntegration(service)?.capabilities.issueRead?.parseIntegrationHash(serviceTaskId)
  if (!issueParts) {
    logError(new Error(`Invalid ${service} integrationHash: ${serviceTaskId}`), {
      tags: {service, teamId: ctx.teamId},
      userId: ctx.userId
    })
    return null
  }
  return {update, integration: {accessUserId: ctx.userId, ...issueParts}}
}

const importTasksForPoker = async (
  additiveUpdates: UpdatePokerScopeItemInput[],
  ctx: IntegrationCtx,
  meetingId: string
) => {
  const {dataLoader, teamId, userId} = ctx
  const pg = getKysely()
  const parabolTaskIds = additiveUpdates
    .filter((update) => update.service === 'PARABOL')
    .map((update) => update.serviceTaskId)
  const parabolTasks = (await dataLoader.get('tasks').loadMany(parabolTaskIds)).filter(isValid)
  const teamTaskIds = new Set(
    parabolTasks.filter((task) => task.teamId === teamId).map(({id}) => id)
  )
  const integratedUpdates = additiveUpdates.filter((update) => update.service !== 'PARABOL')
  const parsedUpdates = integratedUpdates
    .map((update) => parseIntegration(ctx, update))
    .filter(isNotNull)
  const integrationHashes = parsedUpdates.map(({update}) => update.serviceTaskId)
  const existingTasks =
    integrationHashes.length === 0
      ? []
      : await selectTasks()
          .where('integrationHash', 'in', integrationHashes)
          .where('teamId', '=', teamId)
          .where('userId', '=', userId)
          .execute()
  const tasksToAdd = parsedUpdates
    .filter(
      ({update}) => !existingTasks.some((task) => task.integrationHash === update.serviceTaskId)
    )
    .map(({update, integration}) => {
      const plaintextContent = `Task imported from ${integration.service} #archived`
      const content = JSON.stringify(plaintextToTipTap(plaintextContent, {taskTags: ['archived']}))
      return {
        id: generateUID(),
        content,
        plaintextContent,
        createdBy: userId,
        sortOrder: dndNoise(),
        status: 'future' as const,
        teamId,
        integrationHash: update.serviceTaskId,
        integration: JSON.stringify(integration),
        meetingId,
        tags: getTagsFromTipTapTask(JSON.parse(content))
      }
    })
  if (tasksToAdd.length > 0) {
    await pg.insertInto('Task').values(tasksToAdd).execute()
  }
  const taskIdByHash = new Map(
    [...existingTasks, ...tasksToAdd].map(({integrationHash, id}) => [integrationHash, id])
  )
  return additiveUpdates.flatMap((update) => {
    const {service, serviceTaskId} = update
    if (service === 'PARABOL') {
      return teamTaskIds.has(serviceTaskId) ? [{...update, taskId: serviceTaskId}] : []
    }
    const taskId = taskIdByHash.get(serviceTaskId)
    return taskId ? [{...update, taskId}] : []
  })
}

export default importTasksForPoker
