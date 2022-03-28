import graphql from 'babel-plugin-relay/macro'
import {stateToHTML} from 'draft-js-export-html'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import splitDraftContent from '../utils/draftjs/splitDraftContent'
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
        ... on JiraServerIssue {
          descriptionHTML
          summary
        }
        ...TaskIntegrationLinkIntegrationGitHub
        ...TaskIntegrationLinkIntegrationJira
        ...TaskIntegrationLinkIntegrationJiraServer
      }
      updatedAt
      teamId
      userId
    }
  }
`

const mutation = graphql`
  mutation CreateTaskIntegrationMutation(
    $integrationProviderService: IntegrationProviderServiceEnum!
    $integrationRepoId: ID!
    $taskId: ID!
  ) {
    createTaskIntegration(
      integrationProviderService: $integrationProviderService
      integrationRepoId: $integrationRepoId
      taskId: $taskId
    ) {
      error {
        message
      }
      ...CreateTaskIntegrationMutation_task @relay(mask: false)
    }
  }
`

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

const jiraServerTaskIntegrationOptimisticUpdater = (store, variables) => {
  const {taskId} = variables
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
    issueKey: '?',
    updatedAt: now.toJSON()
  } as const
  const integration = createProxyRecord(store, 'JiraServerIssue', optimisticIntegration)
  task.setLinkedRecord(integration, 'integration')
}

const CreateTaskIntegrationMutation: StandardMutation<TCreateTaskIntegrationMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  const {integrationProviderService} = variables

  return commitMutation<TCreateTaskIntegrationMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      if (integrationProviderService === 'jira') {
        jiraTaskIntegrationOptimisticUpdater(store, variables)
      } else if (integrationProviderService === 'github') {
        githubTaskIntegrationOptimisitcUpdater(store, variables)
      } else if (integrationProviderService === 'jiraServer') {
        jiraServerTaskIntegrationOptimisticUpdater(store, variables)
      }
    },
    onCompleted,
    onError
  })
}

export default CreateTaskIntegrationMutation
