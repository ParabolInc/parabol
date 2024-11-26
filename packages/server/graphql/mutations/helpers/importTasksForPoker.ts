import IntegrationHash from 'parabol-client/shared/gqlIds/IntegrationHash'
import {isNotNull} from 'parabol-client/utils/predicates'
import {convertTipTapTaskContent} from '../../../../client/shared/tiptap/convertTipTapTaskContent'
import {getTagsFromTipTapTask} from '../../../../client/shared/tiptap/getTagsFromTipTapTask'
import dndNoise from '../../../../client/utils/dndNoise'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {selectTasks} from '../../../postgres/select'
import {TUpdatePokerScopeItemInput} from '../updatePokerScope'

const importTasksForPoker = async (
  additiveUpdates: TUpdatePokerScopeItemInput[],
  teamId: string,
  userId: string,
  meetingId: string
) => {
  const pg = getKysely()
  const integratedUpdates = additiveUpdates.filter((update) => update.service !== 'PARABOL')
  const integrationHashes = integratedUpdates.map((update) => update.serviceTaskId)
  const existingTasks =
    integrationHashes.length === 0
      ? []
      : await selectTasks()
          .where('integrationHash', 'in', integrationHashes)
          .where('teamId', '=', teamId)
          .where('userId', '=', userId)
          .execute()
  const integrationHashToTaskId = {} as Record<string, string>
  additiveUpdates.map((update) => {
    if (update.service === 'PARABOL') {
      integrationHashToTaskId[update.serviceTaskId] = update.serviceTaskId
    }
  })
  const newIntegrationUpdates = integratedUpdates.filter(
    (update) => !existingTasks.find(({integrationHash}) => update.serviceTaskId === integrationHash)
  )
  const tasksToAdd = newIntegrationUpdates
    .map((update) => {
      const {service, serviceTaskId} = update
      const integrationSplit = IntegrationHash.split(service, serviceTaskId)
      if (!integrationSplit) return null
      const integration = {
        accessUserId: userId,
        ...integrationSplit
      }
      const integrationHash = IntegrationHash.join(integration)
      const plaintextContent = `Task imported from ${integration.service} #archived`
      const content = convertTipTapTaskContent(plaintextContent)
      return {
        id: generateUID(),
        content,
        plaintextContent,
        createdBy: userId,
        sortOrder: dndNoise(),
        status: 'future' as const,
        teamId,
        integrationHash,
        integration: JSON.stringify(integration),
        meetingId,
        tags: getTagsFromTipTapTask(JSON.parse(content))
      }
    })
    .filter(isNotNull)
  if (tasksToAdd.length > 0) {
    await pg.insertInto('Task').values(tasksToAdd).execute()
  }
  const integratedTasks = [...existingTasks, ...tasksToAdd]

  return additiveUpdates.map((update) => {
    const {service, serviceTaskId} = update
    const taskId =
      service === 'PARABOL'
        ? serviceTaskId
        : integratedTasks.find((task) => task.integrationHash === serviceTaskId)!.id
    return {
      ...update,
      taskId
    }
  })
}

export default importTasksForPoker
