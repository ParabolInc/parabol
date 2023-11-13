import isValid from '../../isValid'
import {BatchArchiveTasksSuccessResolvers} from '../resolverTypes'

export type BatchArchiveTasksSuccessSource = {
  archivedTaskIds: string[]
}

const BatchArchiveTasksSuccess: BatchArchiveTasksSuccessResolvers = {
  archivedTasks: async ({archivedTaskIds}, _args, {dataLoader}) => {
    const tasks = (await dataLoader.get('tasks').loadMany(archivedTaskIds)).filter(isValid)
    return tasks
  }
}

export default BatchArchiveTasksSuccess
