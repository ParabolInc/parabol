import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {BatchArchiveTasksMutation_tasks$data} from '~/__generated__/BatchArchiveTasksMutation_tasks.graphql'
import {Task as ITask} from '../../server/postgres/types/index.d'
import {BatchArchiveTasksMutation as TBatchArchiveTasksMutation} from '../__generated__/BatchArchiveTasksMutation.graphql'
import {getTagsFromTipTapTask} from '../shared/tiptap/getTagsFromTipTapTask'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleUpsertTasks from './handlers/handleUpsertTasks'

graphql`
  fragment BatchArchiveTasksMutation_tasks on BatchArchiveTasksSuccess {
    archivedTasks {
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

export const batchArchiveTasksTaskUpdater: SharedUpdater<BatchArchiveTasksMutation_tasks$data> = (
  payload,
  {store}
) => {
  const archivedTasks = payload.getLinkedRecords('archivedTasks')
  archivedTasks.forEach((archivedTask) => {
    const content = archivedTask.getValue('content')
    const doc = JSON.parse(content)
    const nextTags = getTagsFromTipTapTask(doc)
    archivedTask.setValue(nextTags, 'tags')
    handleUpsertTasks(archivedTask as any, store)
    handleRemoveTasks(archivedTask as any, store)
  })
}

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
      const context = {atmosphere, store: store as any}
      batchArchiveTasksTaskUpdater(payload as any, context)
    },
    optimisticUpdater: (store) => {
      const payload = store.getRootField('batchArchiveTasks')
      if (!payload) return
      const context = {atmosphere, store: store as any}
      batchArchiveTasksTaskUpdater(payload as any, context)
    },
    onCompleted,
    onError
  })
}

export default BatchArchiveTasksMutation
