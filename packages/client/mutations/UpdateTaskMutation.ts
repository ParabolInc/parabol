import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleRemoveNotifications from './handlers/handleRemoveNotifications'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import popInvolvementToast from './toasts/popInvolvementToast'
import getTagsFromEntityMap from '../utils/draftjs/getTagsFromEntityMap'
import getInProxy from '../utils/relay/getInProxy'
import updateProxyRecord from '../utils/relay/updateProxyRecord'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import ContentFilterHandler from '../utils/relay/ContentFilterHandler'
import {
  OnNextHandler,
  OnNextHistoryContext,
  OptionalHandlers,
  SharedUpdater
} from '../types/relayMutations'
import {UpdateTaskMutation_task} from '../__generated__/UpdateTaskMutation_task.graphql'
import {UpdateTaskMutation as TUpdateTaskMutation} from '../__generated__/UpdateTaskMutation.graphql'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import Atmosphere from '../Atmosphere'
import {IUpdateTaskOnMutationArguments} from '../types/graphql'

graphql`
  fragment UpdateTaskMutation_task on UpdateTaskPayload {
    task {
      # Entire frag needed in case it is deprivatized
      ...CompleteTaskFrag @relay(mask: false)
      editors {
        userId
        preferredName
      }
    }
    addedNotification {
      type
      changeAuthor {
        preferredName
      }
      ...TaskInvolves_notification @relay(mask: false)
    }
    removedNotification {
      id
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

export const updateTaskTaskOnNext: OnNextHandler<UpdateTaskMutation_task, OnNextHistoryContext> = (
  payload,
  {atmosphere, history}
) => {
  if (!payload || !payload.addedNotification) return
  popInvolvementToast(payload.addedNotification, {atmosphere, history})
}

export const updateTaskTaskUpdater: SharedUpdater<UpdateTaskMutation_task> = (payload, {store}) => {
  const task = payload.getLinkedRecord('task')!
  handleUpsertTasks(task as any, store as any)

  const addedNotification = payload.getLinkedRecord('addedNotification')
  handleAddNotifications(addedNotification as any, store)
  if (task) {
    ContentFilterHandler.update(store, {
      dataID: task.getDataID(),
      fieldKey: 'content'
    })
  }
  const removedNotificationId = getInProxy(payload, 'removedNotification', 'id')
  handleRemoveNotifications(removedNotificationId, store as any)
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const viewerId = viewer && viewer.getDataID()
  const privatizedTaskId = payload.getValue('privatizedTaskId')
  const taskUserId = getInProxy(task, 'userId')
  if (taskUserId !== viewerId && privatizedTaskId) {
    handleRemoveTasks(privatizedTaskId, store, viewerId)
  }
}

const UpdateTaskMutation = (
  atmosphere: Atmosphere,
  {updatedTask, area}: IUpdateTaskOnMutationArguments,
  {onCompleted, onError}: OptionalHandlers = {}
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
      updateTaskTaskUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {id, content, teamId, userId} = updatedTask
      const task = store.get(id)
      if (!task) return
      const now = new Date()
      const optimisticTask = {
        ...updatedTask,
        updatedAt: now.toJSON()
      }
      updateProxyRecord(task, optimisticTask)
      if (teamId || userId) {
        const nextTeamId = teamId || task.getValue('teamId')
        const nextUserId = userId || task.getValue('userId')
        const assigneeId = toTeamMemberId(nextTeamId, nextUserId)
        task.setValue(assigneeId, 'assigneeId')
        const assignee = store.get(assigneeId)
        if (assignee) {
          task.setLinkedRecord(assignee, 'assignee')
          task.setValue(nextUserId, 'userId')
        }
      }
      if (content) {
        const {entityMap} = JSON.parse(content)
        const nextTags = getTagsFromEntityMap(entityMap)
        task.setValue(nextTags, 'tags')
      }
      handleUpsertTasks(task as any, store)
    },
    onCompleted,
    onError
  })
}

export default UpdateTaskMutation
