import {RecordSourceSelectorProxy} from 'relay-runtime'
import createProxyRecord from './createProxyRecord'

const getOptimisticTaskEditor = (
  store: RecordSourceSelectorProxy,
  taskId: string,
  isEditing: boolean
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const task = store.get(taskId)!
  const payload = createProxyRecord(store, 'EditTaskMutationPayload', {
    isEditing
  })
  return payload.setLinkedRecord(viewer, 'editor').setLinkedRecord(task, 'task')
}

export default getOptimisticTaskEditor
