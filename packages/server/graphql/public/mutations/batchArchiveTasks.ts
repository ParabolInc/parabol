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
  const validTasks = tasks.filter(({createdBy}) => createdBy === viewerId)
  const validTaskIds = validTasks.map(({id}) => id)

  // RESOLUTION
  archiveTasksForDB(validTasks)

  validTaskIds.forEach((taskId) => {
    publish(SubscriptionChannel.TASK, taskId, 'BatchArchiveTasksSuccess', {taskId}, subOptions)
  })
  return {taskIds: validTaskIds}
}

export default batchArchiveTasks
