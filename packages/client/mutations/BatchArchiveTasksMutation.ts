import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import ITask from '../../server/database/types/Task'
import {BatchArchiveTasksMutation as TBatchArchiveTasksMutation} from '../__generated__/BatchArchiveTasksMutation.graphql'
import getTagsFromEntityMap from '../utils/draftjs/getTagsFromEntityMap'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import handleRemoveTasks from './handlers/handleRemoveTasks'

graphql`
  fragment BatchArchiveTasksMutation_tasks on BatchArchiveTasksSuccess {
    tasks {
      id
      content
      tags
    }
  }
`

const mutation = graphql`
  mutation BatchArchiveTasksMutation($taskIds: [ID!]!) {
    batchArchiveTasks(taskIds: $taskIds) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...BatchArchiveTasksMutation_tasks @relay(mask: false)
    }
  }
`

const BatchArchiveTasksMutation: StandardMutation<TBatchArchiveTasksMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TBatchArchiveTasksMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const {taskIds} = variables
      const payload = store.getRootField('batchArchiveTasks')
      if (!payload) return
      const error = payload.getLinkedRecord('error')
      if (error) {
        taskIds.forEach((taskId) => {
          const task = store.get<ITask>(taskId)
          if (task) {
            const message = error.getValue('message')
            task.setValue(message, 'error')
          }
        })
      }
      const tasks = payload.getLinkedRecords('tasks')
      if (!tasks) return
      tasks.forEach((task) => {
        handleUpsertTasks(task as any, store)
        handleRemoveTasks(task as any, store)
      })
    },
    optimisticUpdater: (store) => {
      const payload = store.getRootField('batchArchiveTasks')
      if (!payload) return
      const archivedTasks = payload.getLinkedRecords('tasks')
      archivedTasks.forEach((archivedTask) => {
        const content = archivedTask.getValue('content')
        const {entityMap} = JSON.parse(content)
        const nextTags = getTagsFromEntityMap(entityMap)
        archivedTask.setValue(nextTags, 'tags')
        handleUpsertTasks(archivedTask as any, store)
        handleRemoveTasks(archivedTask as any, store)
      })
    },
    onCompleted,
    onError
  })
}

export default BatchArchiveTasksMutation
