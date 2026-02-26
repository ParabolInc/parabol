import type {UpdateTaskDueDatePayloadResolvers} from '../resolverTypes'

export type UpdateTaskDueDatePayloadSource = {taskId: string} | {error: {message: string}}

const UpdateTaskDueDatePayload: UpdateTaskDueDatePayloadResolvers = {
  task: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('tasks').load(source.taskId)) ?? null
  }
}

export default UpdateTaskDueDatePayload
