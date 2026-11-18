import type {EditTaskPayloadResolvers} from '../resolverTypes'

export type EditTaskPayloadSource = {taskId: string; editorId: string; isEditing: boolean}

const EditTaskPayload: EditTaskPayloadResolvers = {
  task: async (source, _args, {dataLoader}) => {
    const task = await dataLoader.get('tasks').load(source.taskId)
    return task ?? null
  },
  editor: (source, _args, {dataLoader}) => {
    return source.editorId ? dataLoader.get('users').loadNonNull(source.editorId) : null
  }
}

export default EditTaskPayload
