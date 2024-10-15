import {getUserId} from '../../../utils/authorization'

import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../../utils/publish'

import {Task} from '../../../postgres/types'
import archiveTasksForDB from '../../../safeMutations/archiveTasksForDB'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'

const batchArchiveTasks: MutationResolvers['batchArchiveTasks'] = async (
  _source,
  {taskIds},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const [viewer, tasks] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    (await dataLoader.get('tasks').loadMany(taskIds)).filter(isValid)
  ])
  const validTasksByTeamId = {} as {[teamId: string]: Task[]}

  for (const task of tasks) {
    const {createdBy, teamId} = task
    const tasks = validTasksByTeamId[teamId] || []

    if (createdBy === viewerId) {
      // if viewer is the task owner, they can archive
      tasks.push(task)
    } else {
      if (viewer.tms.includes(teamId)) {
        // or if viewer is in the team of the task, they can also archive
        tasks.push(task)
      }
    }
    validTasksByTeamId[teamId] = tasks
  }

  const validTasks = Object.values(validTasksByTeamId).flat()
  const teamIds = Object.keys(validTasksByTeamId)
  const archivedTaskIds = validTasks.map(({id}) => id)

  // RESOLUTION
  archiveTasksForDB(validTasks)

  teamIds.forEach((teamId) => {
    const archivedTaskIds = validTasksByTeamId[teamId]?.map(({id}) => id)
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'BatchArchiveTasksSuccess',
      {archivedTaskIds},
      subOptions
    )
  })
  return {archivedTaskIds}
}

export default batchArchiveTasks
