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
import type {UpdatePokerScopeItemInput} from '../../public/resolverTypes'

const parseIntegration = async (ctx: IntegrationCtx, update: UpdatePokerScopeItemInput) => {
  const {service, serviceTaskId} = update
  const integration = await getServerIntegration(service)?.parseIssueHash(ctx, serviceTaskId)
  if (!integration) {
    logError(new Error(`Invalid ${service} integrationHash: ${serviceTaskId}`), {
      tags: {service, teamId: ctx.teamId},
      userId: ctx.userId
    })
    return null
  }
  return {update, integration}
}

const importTasksForPoker = async (
  additiveUpdates: UpdatePokerScopeItemInput[],
  ctx: IntegrationCtx,
  meetingId: string
) => {
  const {teamId, userId} = ctx
  const pg = getKysely()
  const integratedUpdates = additiveUpdates.filter((update) => update.service !== 'PARABOL')
  const parsedUpdates = (
    await Promise.all(integratedUpdates.map((update) => parseIntegration(ctx, update)))
  ).filter(isNotNull)
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
    const taskId = service === 'PARABOL' ? serviceTaskId : taskIdByHash.get(serviceTaskId)
    return taskId ? [{...update, taskId}] : []
  })
}

export default importTasksForPoker
