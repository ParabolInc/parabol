import graphql from 'babel-plugin-relay/macro'
import {stateToHTML} from 'draft-js-export-html'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import splitDraftContent from '../utils/draftjs/splitDraftContent'
import makeSuggestedIntegrationId from '../utils/makeSuggestedIntegrationId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {CreateTaskIntegrationMutation as TCreateTaskIntegrationMutation} from '../__generated__/CreateTaskIntegrationMutation.graphql'

graphql`
  fragment CreateTaskIntegrationMutation_task on CreateTaskIntegrationPayload {
    task {
      ...IntegratedTaskContent_task
      integration {
        __typename
        ... on JiraIssue {
          cloudId
          cloudName
          url
          issueKey
          summary
          descriptionHTML
          projectKey
          project {
            name
          }
        }
        ... on _xGitHubIssue {
          bodyHTML
          title
          number
          repository {
            nameWithOwner
          }
        }
        ...TaskIntegrationLinkIntegrationGitHub
        ...TaskIntegrationLinkIntegrationJira
      }
      updatedAt
      teamId
      userId
    }
  }
`

const mutation = graphql`
  mutation CreateTaskIntegrationMutation(
    $integrationProviderType: IntegrationProviderTypeEnum!
    $projectId: ID!
    $taskId: ID!
  ) {
    createTaskIntegration(
      integrationProviderType: $integrationProviderType
      projectId: $projectId
      taskId: $taskId
    ) {
      error {
        message
      }
      ...CreateTaskIntegrationMutation_task @relay(mask: false)
    }
  }
`

const jiraTaskIntegrationUpdater = (store) => {
  // TODO break out into subscription & also reorder suggested items (put newest on top if exists)
  const payload = store.getRootField('createTaskIntegration')
  if (!payload) return
  const task = payload.getLinkedRecord('task')
  if (!task) return
  const userId = task.getValue('userId')
  const teamId = task.getValue('teamId')
  const integration = task.getLinkedRecord('integration')
  if (!userId) return
  const user = store.get(userId)
  if (!user || !integration) return
  const suggestedIntegrations = user.getLinkedRecord('suggestedIntegrations', {teamId})
  const projectKey = integration.getValue('projectKey')
  if (!suggestedIntegrations || !projectKey) return
  const items = suggestedIntegrations.getLinkedRecords('items')
  if (!items) return
  const existingIntegration = items.find(
    (item) => item && item.getValue('projectKey') === projectKey
  )
  const hasMore = suggestedIntegrations.getValue('hasMore')
  if (!existingIntegration || !hasMore) {
    const project = integration.getLinkedRecord('project')
    if (!project) return
    const projectName = project.getValue('projectName')
    const cloudId = integration.getValue('cloudId')
    if (!projectName || !cloudId) return
    const nextItem = {
      cloudId,
      projectKey,
      projectName,
      service: 'jira'
    } as const
    const id = makeSuggestedIntegrationId(nextItem)
    // the fallback is likely never used
    const latestIntegration =
      store.get(id) ||
      createProxyRecord(store, 'SuggestedIntegrationJira', {
        id,
        ...nextItem
      })
    const nextSuggestedIntegrations = [latestIntegration, ...items].slice(0, hasMore ? 3 : 1)
    suggestedIntegrations.setLinkedRecords(nextSuggestedIntegrations, 'items')
    suggestedIntegrations.setValue(true, 'hasMore')
  }
}

const jiraTaskIntegrationOptimisticUpdater = (store, variables) => {
  const {cloudId, projectKey, taskId} = variables
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const contentStr = task.getValue('content') as string
  if (!contentStr) return
  const {title: summary, contentState} = splitDraftContent(contentStr)
  const descriptionHTML = stateToHTML(contentState)
  const optimisticIntegration = {
    summary,
    descriptionHTML,
    projectKey,
    cloudId,
    issueKey: '?',
    cloudName: '',
    updatedAt: now.toJSON()
  } as const
  const integration = createProxyRecord(store, 'JiraIssue', optimisticIntegration)
  task.setLinkedRecord(integration, 'integration')
}

const githubTaskIntegrationOptimisitcUpdater = (store, variables) => {
  const {nameWithOwner, taskId} = variables
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const integrationRepository = createProxyRecord(store, '_xGitHubRepository', {
    nameWithOwner
  })
  const contentStr = task.getValue('content') as string
  if (!contentStr) return
  const {title, contentState} = splitDraftContent(contentStr)
  const bodyHTML = stateToHTML(contentState)
  const optimisticIntegration = {
    title,
    bodyHTML,
    number: 0,
    updatedAt: now.toJSON()
  } as const
  const integration = createProxyRecord(store, '_xGitHubIssue', optimisticIntegration)
  integration.setLinkedRecord(integrationRepository, 'repository')
  task.setLinkedRecord(integration, 'integration')
}

const CreateTaskIntegrationMutation: StandardMutation<TCreateTaskIntegrationMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  const {integrationProviderType} = variables

  return commitMutation<TCreateTaskIntegrationMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      if (integrationProviderType === 'jira') {
        jiraTaskIntegrationUpdater(store)
      }
    },
    optimisticUpdater: (store) => {
      if (integrationProviderType === 'jira') {
        jiraTaskIntegrationOptimisticUpdater(store, variables)
      } else if (integrationProviderType === 'github') {
        githubTaskIntegrationOptimisitcUpdater(store, variables)
      }
    },
    onCompleted,
    onError
  })
}

export default CreateTaskIntegrationMutation
