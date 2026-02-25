import type {EditTaskPayloadResolvers} from '../resolverTypes'

export type EditTaskPayloadSource =
  | {taskId: string; editorId: string; isEditing: boolean}
  | {error: {message: string}}

const EditTaskPayload: EditTaskPayloadResolvers = {
  task: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const task = await dataLoader.get('tasks').load(source.taskId)
    return task ?? null
  },
  editor: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return source.editorId ? dataLoader.get('users').loadNonNull(source.editorId) : null
  }
}

export default EditTaskPayload
