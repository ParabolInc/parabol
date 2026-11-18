import type {UpdateTaskDueDatePayloadResolvers} from '../resolverTypes'

export type UpdateTaskDueDatePayloadSource = {taskId: string}

const UpdateTaskDueDatePayload: UpdateTaskDueDatePayloadResolvers = {
  task: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('tasks').load(source.taskId)) ?? null
  }
}

export default UpdateTaskDueDatePayload
