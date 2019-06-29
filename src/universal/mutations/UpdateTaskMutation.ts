import {commitMutation, graphql} from 'react-relay'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks'
import popInvolvementToast from 'universal/mutations/toasts/popInvolvementToast'
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap'
import getInProxy from 'universal/utils/relay/getInProxy'
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord'
import handleRemoveTasks from 'universal/mutations/handlers/handleRemoveTasks'
import ContentFilterHandler from 'universal/utils/relay/ContentFilterHandler'
import {
  LocalHandlers,
  OnNextHandler,
  SharedUpdater,
  StandardMutation
} from 'universal/types/relayMutations'
import {UpdateTaskMutation_task} from '__generated__/UpdateTaskMutation_task.graphql'
import {UpdateTaskMutation as TUpdateTaskMutation} from '__generated__/UpdateTaskMutation.graphql'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

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

export const updateTaskTaskOnNext: OnNextHandler<UpdateTaskMutation_task> = (
  payload,
  {atmosphere, history}
) => {
  if (!payload) return
  popInvolvementToast(payload.addedNotification, {atmosphere, history})
}

export const updateTaskTaskUpdater: SharedUpdater<UpdateTaskMutation_task> = (payload, {store}) => {
  const task = payload.getLinkedRecord('task')
  handleUpsertTasks(task, store)

  const addedNotification = payload.getLinkedRecord('addedNotification')
  handleAddNotifications(addedNotification, store)
  if (task) {
    ContentFilterHandler.update(store, {
      dataID: task.getDataID(),
      fieldKey: 'content'
    })
  }
  const removedNotificationId = getInProxy(payload, 'removedNotification', 'id')
  handleRemoveNotifications(removedNotificationId, store)
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const viewerId = viewer && viewer.getDataID()
  const privatizedTaskId = payload.getValue('privatizedTaskId')
  const taskUserId = getInProxy(task, 'userId')
  if (taskUserId !== viewerId && privatizedTaskId) {
    handleRemoveTasks(privatizedTaskId, store, viewerId)
  }
}

const UpdateTaskMutation: StandardMutation<TUpdateTaskMutation> = (
  atmosphere,
  {updatedTask, area},
  {onCompleted, onError}: LocalHandlers = {}
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
