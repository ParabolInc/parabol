import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import isTempId from '../utils/relay/isTempId'
import {DeleteTaskMutation as TDeleteTaskMutation} from '../__generated__/DeleteTaskMutation.graphql'
import {DeleteTaskMutation_task} from '../__generated__/DeleteTaskMutation_task.graphql'
import handleRemoveTasks from './handlers/handleRemoveTasks'

graphql`
  fragment DeleteTaskMutation_task on DeleteTaskPayload {
    task {
      id
    }
  }
`

const mutation = graphql`
  mutation DeleteTaskMutation($taskId: ID!) {
    deleteTask(taskId: $taskId) {
      error {
        message
      }
      ...DeleteTaskMutation_task @relay(mask: false)
    }
  }
`

export const deleteTaskTaskUpdater: SharedUpdater<DeleteTaskMutation_task> = (payload, {store}) => {
  const taskId = payload.getLinkedRecord('task').getValue('id')
  handleRemoveTasks(taskId, store)
}

const DeleteTaskMutation: SimpleMutation<TDeleteTaskMutation> = (atmosphere, variables) => {
  const {taskId} = variables
  if (isTempId(taskId)) return undefined
  return commitMutation<TDeleteTaskMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('deleteTask')
      if (!payload) return
      deleteTaskTaskUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      handleRemoveTasks(taskId, store)
    }
  })
}

export default DeleteTaskMutation
