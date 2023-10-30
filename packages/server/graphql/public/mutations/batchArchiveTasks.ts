import {getUserId} from '../../../utils/authorization'

import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../../utils/publish'

import {MutationResolvers} from '../resolverTypes'
import isValid from '../../isValid'
import archiveTasksForDB from '../../../safeMutations/archiveTasksForDB'

const batchArchiveTasks: MutationResolvers['batchArchiveTasks'] = async (
  _source,
  {taskIds},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const tasks = (await dataLoader.get('tasks').loadMany(taskIds)).filter(isValid)
  const validTasks = tasks.filter(async ({createdBy, teamId}) => {
    if (createdBy === viewerId) {
      // if viewer is the task owner, they can archive
      return true
    }
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    // or if viewer is in the team of the task, they can also archive
    return teamMembers.some(({userId}) => userId === viewerId)
  })
  const teamIds = validTasks.map(({teamId}) => teamId)
  const archivedTaskIds = validTasks.map(({id}) => id)

  // RESOLUTION
  archiveTasksForDB(validTasks)

  teamIds.forEach((teamId) => {
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
