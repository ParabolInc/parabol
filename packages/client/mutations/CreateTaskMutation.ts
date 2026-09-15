import {generateJSON, generateText, type JSONContent} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import type {CreateTaskMutation_notification$data} from '../__generated__/CreateTaskMutation_notification.graphql'
import type {CreateTaskMutation_task$data} from '../__generated__/CreateTaskMutation_task.graphql'
import type Atmosphere from '../Atmosphere'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import type {
  OnNextHandler,
  OnNextNavigateContext,
  OptionalHandlers,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import getOptimisticTaskEditor from '../utils/relay/getOptimisticTaskEditor'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleAzureCreateIssue from './handlers/handleAzureCreateIssue'
import handleEditTask from './handlers/handleEditTask'
import handleGitHubCreateIssue from './handlers/handleGitHubCreateIssue'
import handleGitLabCreateIssue from './handlers/handleGitLabCreateIssue'
import handleJiraCreateIssue from './handlers/handleJiraCreateIssue'
import handleLinearCreateIssue from './handlers/handleLinearCreateIssue'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import popInvolvementToast from './toasts/popInvolvementToast'

graphql`
  fragment CreateTaskMutation_task on CreateTaskPayload {
    task {
      ...CompleteTaskFrag @relay(mask: false)
      ...ThreadedItem_threadable
      discussionId
      threadSortOrder
      threadParentId
      replies {
        ...ThreadedRepliesList_replies
      }
      integrationHash
      integration {
        ... on JiraIssue {
          service
          cloudId
          cloudName
          url
          issueKey
          projectKey
          summary
          descriptionHTML
        }
        ... on _xGitHubIssue {
          service
          number
          title
          repository {
            nameWithOwner
          }
        }
        ... on _xGitLabIssue {
          service
          id
          iid
          title
          webPath
          webUrl
        }
        ... on AzureDevOpsWorkItem {
          service
          id
          title
          url
          project {
            name
          }
        }
        ... on _xLinearIssue {
          __typename
          service
          id
          description
          identifier
          title
          linearProject: project {
            name
          }
          team {
            name
          }
          url
        }
      }
    }
  }
`

graphql`
  fragment CreateTaskMutation_notification on CreateTaskPayload {
    involvementNotification {
      team {
        id
      }
      ...TaskInvolves_notification @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation CreateTaskMutation($newTask: CreateTaskInput!) {
    createTask(newTask: $newTask) {
      error {
        message
      }
      ...CreateTaskMutation_task @relay(mask: false)
    }
  }
`

export const createTaskTaskUpdater: SharedUpdater<CreateTaskMutation_task$data> = (
  payload,
  {store}
) => {
  const task = payload.getLinkedRecord('task')
  if (!task) return
  const taskId = task.getValue('id')
  const content = task.getValue('content')
  const rawContent = JSON.parse(content) as JSONContent
  const isEditing =
    !rawContent.content ||
    rawContent.content.length === 0 ||
    (rawContent.content.length === 1 && rawContent.content[0]?.text === '')
  const editorPayload = getOptimisticTaskEditor(store, taskId, isEditing)
  handleEditTask(editorPayload, store)
  handleUpsertTasks(task, store)
  handleJiraCreateIssue(task, store)
  handleGitHubCreateIssue(task, store)
  handleGitLabCreateIssue(task, store)
  handleAzureCreateIssue(task, store)
  handleLinearCreateIssue(task, store)
}

export const createTaskNotificationOnNext: OnNextHandler<
  CreateTaskMutation_notification$data,
  OnNextNavigateContext
> = (payload, {atmosphere, navigate}) => {
  if (!payload || !payload.involvementNotification) return
  popInvolvementToast(payload.involvementNotification, {atmosphere, navigate})
}

export const createTaskNotificationUpdater: SharedUpdater<CreateTaskMutation_notification$data> = (
  payload,
  {store}
) => {
  const notification = payload.getLinkedRecord('involvementNotification' as any)
  if (!notification) return
  handleAddNotifications(notification, store)
}

const CreateTaskMutation: StandardMutation<TCreateTaskMutation, OptionalHandlers> = (
  atmosphere: Atmosphere,
  variables,
  {onError, onCompleted}
) => {
  const {viewerId} = atmosphere
  const {newTask} = variables
  const isEditing = !newTask.content
  return commitMutation<TCreateTaskMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const context = {atmosphere, store}
      const payload = store.getRootField('createTask')
      if (!payload) return
      createTaskTaskUpdater(payload, context)
    },
    optimisticUpdater: (store) => {
      const {teamId, userId, integration, ...rest} = newTask
      const now = new Date().toJSON()
      const taskId = clientTempId(teamId)
      const viewer = store.getRoot().getLinkedRecord('viewer')
      const plaintextContent =
        newTask.plaintextContent ||
        (newTask.content ? generateText(JSON.parse(newTask.content), serverTipTapExtensions) : '')
      const optimisticTask = {
        ...rest,
        id: taskId,
        teamId,
        userId,
        createdAt: now,
        createdBy: viewerId,
        updatedAt: now,
        tags: [],
        content: newTask.content || JSON.stringify(generateJSON('<p></p>', serverTipTapExtensions)),
        title: plaintextContent,
        plaintextContent
      }
      const task = createProxyRecord(store, 'Task', optimisticTask)
        .setLinkedRecord(store.get(teamId)!, 'team')
        .setLinkedRecord(userId ? store.get(userId)! : null, 'user')
        .setLinkedRecord(viewer, 'createdByUser')
        .setLinkedRecords([], 'replies')
      const editorPayload = getOptimisticTaskEditor(store, taskId, isEditing)
      handleEditTask(editorPayload, store)
      //TODO #7943 Optimistic updates on arrays has a bug in Relay. As a workaround until it's fixed properly, let's just not do optimistic updates
      //handleUpsertTasks(task as any, store)
      handleJiraCreateIssue(task, store)
      handleGitHubCreateIssue(task as any, store)
      handleGitLabCreateIssue(task as any, store)
      handleAzureCreateIssue(task as any, store)
      handleLinearCreateIssue(task as any, store)
    },
    onError,
    onCompleted
  })
}

export default CreateTaskMutation
