import graphql from 'babel-plugin-relay/macro'
import {commitMutation, Disposable} from 'react-relay'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import getOptimisticTaskEditor from '../utils/relay/getOptimisticTaskEditor'
import isTempId from '../utils/relay/isTempId'
import {EditTaskMutation as TEditTaskMutation} from '../__generated__/EditTaskMutation.graphql'
import {EditTaskMutation_task} from '../__generated__/EditTaskMutation_task.graphql'
import handleEditTask from './handlers/handleEditTask'

graphql`
  fragment EditTaskMutation_task on EditTaskPayload {
    task {
      id
    }
    editor {
      id
      preferredName
    }
    isEditing
  }
`

const mutation = graphql`
  mutation EditTaskMutation($taskId: ID!, $isEditing: Boolean!) {
    editTask(taskId: $taskId, isEditing: $isEditing) {
      error {
        message
      }
      ...EditTaskMutation_task @relay(mask: false)
    }
  }
`

export const editTaskTaskUpdater: SharedUpdater<EditTaskMutation_task> = (payload, {store}) => {
  handleEditTask(payload, store)
}

const EditTaskMutation: SimpleMutation<TEditTaskMutation> = (atmosphere, {taskId, isEditing}) => {
  if (isTempId(taskId)) return undefined as unknown as Disposable
  return commitMutation<TEditTaskMutation>(atmosphere, {
    mutation,
    variables: {taskId, isEditing},
    updater: (store) => {
      const payload = store.getRootField('editTask')
      if (!payload) return
      editTaskTaskUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const payload = getOptimisticTaskEditor(store, taskId, isEditing)
      handleEditTask(payload, store)
    }
  })
}

export default EditTaskMutation
