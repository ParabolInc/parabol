import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import getInProxy from '../utils/relay/getInProxy'
import isTempId from '../utils/relay/isTempId'
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

export const deleteTaskTaskUpdater = (payload, store) => {
  const taskId = getInProxy(payload, 'task', 'id')
  handleRemoveTasks(taskId, store)
}

const DeleteTaskMutation = (environment, taskId, _teamId, onError?, onCompleted?) => {
  if (isTempId(taskId)) return undefined
  return commitMutation(environment, {
    mutation,
    variables: {taskId},
    updater: (store) => {
      const payload = store.getRootField('deleteTask')
      if (!payload) return
      deleteTaskTaskUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      handleRemoveTasks(taskId, store)
    },
    onError,
    onCompleted
  })
}

export default DeleteTaskMutation
