import isValid from '../../isValid'
import type {BatchArchiveTasksPayloadResolvers} from '../resolverTypes'

export type BatchArchiveTasksPayloadSource = {
  archivedTaskIds: string[]
}

const BatchArchiveTasksPayload: BatchArchiveTasksPayloadResolvers = {
  archivedTasks: async ({archivedTaskIds}, _args, {dataLoader}) => {
    const tasks = (await dataLoader.get('tasks').loadMany(archivedTaskIds)).filter(isValid)
    return tasks
  }
}

export default BatchArchiveTasksPayload
