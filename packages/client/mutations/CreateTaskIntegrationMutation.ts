import graphql from 'babel-plugin-relay/macro'
import {stateToHTML} from 'draft-js-export-html'
import {commitMutation} from 'react-relay'
import JiraProjectId from '~/shared/gqlIds/JiraProjectId'
import {StandardMutation} from '../types/relayMutations'
import splitDraftContent from '../utils/draftjs/splitDraftContent'
import getMeetingPathParams from '../utils/meetings/getMeetingPathParams'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {CreateTaskIntegrationMutation as TCreateTaskIntegrationMutation} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import SendClientSegmentEventMutation from './SendClientSegmentEventMutation'

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
        ... on _xGitLabIssue {
          descriptionHtml
          title
          iid
          webPath
          webUrl
        }
        ...TaskIntegrationLinkIntegrationGitHub
        ...TaskIntegrationLinkIntegrationJira
        ...TaskIntegrationLinkIntegrationJiraServer
        ...TaskIntegrationLinkIntegrationGitLab
      }
      updatedAt
      teamId
      userId
      id
      taskService
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
  const {integrationRepoId, taskId} = variables
  const {cloudId, projectKey} = JiraProjectId.split(integrationRepoId)
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
  const {integrationRepoId, taskId} = variables
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const integrationRepository = createProxyRecord(store, '_xGitHubRepository', {
    nameWithOwner: integrationRepoId
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

const gitlabTaskIntegrationOptimisitcUpdater = (store, variables) => {
  const {integrationRepoId: fullPath, taskId} = variables
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const integrationRepository = createProxyRecord(store, '_xGitLabProject', {
    fullPath
  })
  const contentStr = task.getValue('content') as string
  if (!contentStr) return
  const {title, contentState} = splitDraftContent(contentStr)
  const descriptionHtml = stateToHTML(contentState)
  const webPath = `${fullPath}/-/issues/0`
  const optimisticIntegration = {
    title,
    descriptionHtml,
    iid: 0,
    webPath,
    webUrl: `https://gitlab.com/${webPath}`,
    updatedAt: now.toJSON()
  } as const
  const integration = createProxyRecord(store, '_xGitLabIssue', optimisticIntegration)
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
      } else if (integrationProviderService === 'gitlab') {
        gitlabTaskIntegrationOptimisitcUpdater(store, variables)
      }
    },
    onCompleted: (data, errors) => {
      if (onCompleted) {
        onCompleted(data, errors)
      }
      const {meetingId} = getMeetingPathParams()
      const store = atmosphere.getStore()
      const meetingType = (store as any)?._recordSource?._records?.get(meetingId)?.meetingType
      if (data.createTaskIntegration && !data?.createTaskIntegration?.error) {
        SendClientSegmentEventMutation(atmosphere, 'Task Published', {
          taskId: data.createTaskIntegration.task?.id,
          teamId: data.createTaskIntegration.task?.teamId,
          inMeeting: !!meetingId,
          meetingId,
          meetingType,
          service: data.createTaskIntegration.task?.taskService
        })
      }
    },
    onError
  })
}

export default CreateTaskIntegrationMutation
