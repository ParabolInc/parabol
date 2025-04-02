import {generateText} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {Task as ITask} from '../../server/postgres/types/index.d'
import {UpdateTaskMutation as TUpdateTaskMutation} from '../__generated__/UpdateTaskMutation.graphql'
import {UpdateTaskMutation_task$data} from '../__generated__/UpdateTaskMutation_task.graphql'
import {getTagsFromTipTapTask} from '../shared/tiptap/getTagsFromTipTapTask'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {
  OnNextHandler,
  OnNextHistoryContext,
  OptionalHandlers,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import popInvolvementToast from './toasts/popInvolvementToast'

graphql`
  fragment UpdateTaskMutation_task on UpdateTaskPayload {
    task {
      # Entire frag needed in case it is deprivatized
      ...CompleteTaskFrag @relay(mask: false)
      id
      editors {
        userId
        preferredName
      }
    }
    addedNotification {
      type
      changeAuthor {
        user {
          preferredName
        }
      }
      team {
        id
      }
      ...TaskInvolves_notification @relay(mask: false)
    }
    privatizedTaskId
  }
`

const mutation = graphql`
  mutation UpdateTaskMutation($updatedTask: UpdateTaskInput!, $area: AreaEnum) {
    updateTask(updatedTask: $updatedTask, area: $area) {
      error {
        message
      }
      ...UpdateTaskMutation_task @relay(mask: false)
    }
  }
`

export const updateTaskTaskOnNext: OnNextHandler<
  UpdateTaskMutation_task$data,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  if (!payload || !payload.addedNotification) return
  popInvolvementToast(payload.addedNotification, {atmosphere, history})
}

export const updateTaskTaskUpdater: SharedUpdater<UpdateTaskMutation_task$data> = (
  payload,
  {store}
) => {
  const task = payload.getLinkedRecord('task')!
  handleUpsertTasks(task as any, store as any)

  const addedNotification = payload.getLinkedRecord('addedNotification')
  handleAddNotifications(addedNotification as any, store)
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const viewerId = viewer && viewer.getDataID()
  const privatizedTaskId = payload.getValue('privatizedTaskId')
  const taskUserId = task.getValue('userId')
  if (taskUserId !== viewerId && privatizedTaskId) {
    handleRemoveTasks(privatizedTaskId, store)
  }
}

const UpdateTaskMutation: StandardMutation<TUpdateTaskMutation, OptionalHandlers> = (
  atmosphere,
  {updatedTask, area},
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateTaskMutation>(atmosphere, {
    mutation,
    variables: {
      area,
      updatedTask
    },
    updater: (store) => {
      const payload = store.getRootField('updateTask')
      if (!payload) return
      const error = payload.getLinkedRecord('error')
      if (error) {
        const {id: taskId} = updatedTask
        const task = store.get<ITask>(taskId)
        if (task) {
          const message = error.getValue('message')
          task.setValue(message, 'error')
        }
      }
      updateTaskTaskUpdater(payload, {atmosphere, store: store as any})
    },
    optimisticUpdater: (store) => {
      const {id, content, userId, status, sortOrder} = updatedTask
      const task = store.get(id)
      if (!task) return
      status && task.setValue(status, 'status')
      sortOrder && task.setValue(sortOrder, 'sortOrder')
      if (userId) {
        task.setValue(userId, 'userId')
        task.setLinkedRecord(store.get(userId)!, 'user')
      }
      if (content) {
        // do not update content because that will cause the editor to rebuild itself
        // we only want a rebuild if someone else changes the content
        const contentJSON = JSON.parse(content)
        const nextTags = getTagsFromTipTapTask(contentJSON)
        task.setValue(nextTags, 'tags')
        const plaintextContent = generateText(contentJSON, serverTipTapExtensions)
        task.setValue(plaintextContent, 'plaintextContent')
      }
      handleUpsertTasks(task as any, store)
    },
    onError,
    onCompleted
  })
}

export default UpdateTaskMutation
