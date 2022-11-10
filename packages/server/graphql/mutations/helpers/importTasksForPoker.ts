import IntegrationHash from 'parabol-client/shared/gqlIds/IntegrationHash'
import {isNotNull} from 'parabol-client/utils/predicates'
import getRethink from '../../../database/rethinkDriver'
import ImportedTask from '../../../database/types/ImportedTask'
import {TUpdatePokerScopeItemInput} from '../updatePokerScope'

const importTasksForPoker = async (
  additiveUpdates: TUpdatePokerScopeItemInput[],
  teamId: string,
  userId: string,
  meetingId: string
) => {
  const r = await getRethink()
  const integratedUpdates = additiveUpdates.filter((update) => update.service !== 'PARABOL')
  const integrationHashes = integratedUpdates.map((update) => update.serviceTaskId)
  const existingTasks = await r
    .table('Task')
    .getAll(r.args(integrationHashes), {index: 'integrationHash'})
    .filter({teamId})
    .run()
  const integrationHashToTaskId = {} as Record<string, string>
  additiveUpdates.map((update) => {
    if (update.service === 'PARABOL') {
      integrationHashToTaskId[update.serviceTaskId] = update.serviceTaskId
    } else {
    }
  })
  const newIntegrationUpdates = integratedUpdates.filter(
    (update) => !existingTasks.find(({integrationHash}) => update.serviceTaskId === integrationHash)
  )
  const tasksToAdd = newIntegrationUpdates
    .map((update) => {
      const {service, serviceTaskId} = update
      const integration = IntegrationHash.split(service, serviceTaskId)
      if (!integration) return null
      return new ImportedTask({
        userId,
        integration: {
          accessUserId: userId,
          ...integration
        },
        meetingId,
        teamId
      })
    })
    .filter(isNotNull)

  if (newIntegrationUpdates.length > 0) {
    await r.table('Task').insert(tasksToAdd).run()
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
