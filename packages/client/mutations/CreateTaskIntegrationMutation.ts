import {generateHTML} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RecordSourceSelectorProxy} from 'relay-runtime'
import JiraProjectId from '~/shared/gqlIds/JiraProjectId'
import {CreateTaskIntegrationMutation as TCreateTaskIntegrationMutation} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {splitTipTapContent} from '../shared/tiptap/splitTipTapContent'
import {StandardMutation} from '../types/relayMutations'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import getMeetingPathParams from '../utils/meetings/getMeetingPathParams'
import createProxyRecord from '../utils/relay/createProxyRecord'

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
        ... on AzureDevOpsWorkItem {
          __typename
          id
          teamProject
          title
          url
        }
        ... on _xLinearIssue {
          __typename
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
        ...TaskIntegrationLinkIntegrationGitHub
        ...TaskIntegrationLinkIntegrationJira
        ...TaskIntegrationLinkIntegrationJiraServer
        ...TaskIntegrationLinkIntegrationGitLab
        ...TaskIntegrationLinkIntegrationAzure
        ...TaskIntegrationLinkIntegrationLinear
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

const jiraTaskIntegrationOptimisticUpdater = (
  store: RecordSourceSelectorProxy,
  variables: TCreateTaskIntegrationMutation['variables']
) => {
  const {integrationRepoId, taskId} = variables
  const {cloudId, projectKey} = JiraProjectId.split(integrationRepoId)
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const contentStr = task.getValue('content') as string
  if (!contentStr) return
  const {title: summary, bodyContent} = splitTipTapContent(JSON.parse(contentStr))
  const descriptionHTML = generateHTML(bodyContent, serverTipTapExtensions)
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

const githubTaskIntegrationOptimisticUpdater = (
  store: RecordSourceSelectorProxy,
  variables: TCreateTaskIntegrationMutation['variables']
) => {
  const {integrationRepoId, taskId} = variables
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const integrationRepository = createProxyRecord(store, '_xGitHubRepository', {
    nameWithOwner: integrationRepoId
  })
  const contentStr = task.getValue('content') as string
  if (!contentStr) return
  const {title, bodyContent} = splitTipTapContent(JSON.parse(contentStr))
  const bodyHTML = generateHTML(bodyContent, serverTipTapExtensions)
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

const gitlabTaskIntegrationOptimisticUpdater = (
  store: RecordSourceSelectorProxy,
  variables: TCreateTaskIntegrationMutation['variables']
) => {
  const {integrationRepoId: fullPath, taskId} = variables
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const integrationRepository = createProxyRecord(store, '_xGitLabProject', {
    fullPath
  })
  const contentStr = task.getValue('content') as string
  if (!contentStr) return
  const {title, bodyContent} = splitTipTapContent(JSON.parse(contentStr))
  const descriptionHtml = generateHTML(bodyContent, serverTipTapExtensions)
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

const jiraServerTaskIntegrationOptimisticUpdater = (
  store: RecordSourceSelectorProxy,
  variables: TCreateTaskIntegrationMutation['variables']
) => {
  const {taskId} = variables
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const contentStr = task.getValue('content') as string
  if (!contentStr) return
  const {title: summary, bodyContent} = splitTipTapContent(JSON.parse(contentStr))
  const descriptionHTML = generateHTML(bodyContent, serverTipTapExtensions)
  const optimisticIntegration = {
    summary,
    descriptionHTML,
    issueKey: '?',
    updatedAt: now.toJSON()
  } as const
  const integration = createProxyRecord(store, 'JiraServerIssue', optimisticIntegration)
  task.setLinkedRecord(integration, 'integration')
}

const azureTaskIntegrationOptimisticUpdater = (
  store: RecordSourceSelectorProxy,
  variables: TCreateTaskIntegrationMutation['variables']
) => {
  const {integrationRepoId: teamProject, taskId} = variables
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const contentStr = task.getValue('content') as string
  if (!contentStr) return
  const {title, bodyContent} = splitTipTapContent(JSON.parse(contentStr))
  const descriptionHTML = generateHTML(bodyContent, serverTipTapExtensions)
  const optimisticIntegration = {
    id: '?',
    title,
    descriptionHTML,
    teamProject,
    type: 'Issue',
    url: `https://dev.azure.com`,
    updatedAt: now.toJSON()
  } as const
  const integration = createProxyRecord(store, 'AzureDevOpsWorkItem', optimisticIntegration)
  task.setLinkedRecord(integration, 'integration')
}

const linearTaskIntegrationOptimisticUpdater = (
  store: RecordSourceSelectorProxy,
  variables: TCreateTaskIntegrationMutation['variables']
) => {
  const {taskId} = variables
  const now = new Date()
  const task = store.get(taskId)
  if (!task) return
  const contentStr = task.getValue('content') as string
  if (!contentStr) return
  const integrationProject = createProxyRecord(store, '_xLinearProject', {
    name: '?'
  })
  const integrationTeam = createProxyRecord(store, '_xLinearTeam', {
    name: '?'
  })
  const {title, bodyContent} = splitTipTapContent(JSON.parse(contentStr))
  const description = generateHTML(bodyContent, serverTipTapExtensions)
  const optimisticIntegration = {
    id: '?',
    description,
    identifier: '?',
    title,
    updatedAt: now.toJSON()
  } as const
  const integration = createProxyRecord(store, '_xLinearIssue', optimisticIntegration)
  integration.setLinkedRecord(integrationProject, 'project')
  integration.setLinkedRecord(integrationTeam, 'team')
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
        githubTaskIntegrationOptimisticUpdater(store, variables)
      } else if (integrationProviderService === 'jiraServer') {
        jiraServerTaskIntegrationOptimisticUpdater(store, variables)
      } else if (integrationProviderService === 'gitlab') {
        gitlabTaskIntegrationOptimisticUpdater(store, variables)
      } else if (integrationProviderService === 'azureDevOps') {
        azureTaskIntegrationOptimisticUpdater(store, variables)
      } else if (integrationProviderService === 'linear') {
        linearTaskIntegrationOptimisticUpdater(store, variables)
      }
    },
    onCompleted: (data, errors) => {
      if (onCompleted) {
        onCompleted(data, errors)
      }
      const {meetingId} = getMeetingPathParams()
      const store = atmosphere.getStore()
      const meetingType = meetingId
        ? (store.getSource().get(meetingId) as any)?.meetingType
        : undefined
      if (data.createTaskIntegration && !data?.createTaskIntegration?.error) {
        SendClientSideEvent(atmosphere, 'Task Published', {
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
