import isValid from '../../isValid'
import {BatchArchiveTasksSuccessResolvers} from '../resolverTypes'

export type BatchArchiveTasksSuccessSource = {
  taskIds: string[]
}

const BatchArchiveTasksSuccess: BatchArchiveTasksSuccessResolvers = {
  tasks: async ({taskIds}, _args, {dataLoader}) => {
    const tasks = (await dataLoader.get('tasks').loadMany(taskIds)).filter(isValid)
    return tasks
  }
}

export default BatchArchiveTasksSuccess
