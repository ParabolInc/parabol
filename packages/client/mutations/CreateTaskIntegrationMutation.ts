import {generateHTML} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {
  IntegrationProviderServiceEnum,
  CreateTaskIntegrationMutation as TCreateTaskIntegrationMutation
} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {splitTipTapContent} from '../shared/tiptap/splitTipTapContent'
import {tipTapToMarkdown} from '../shared/tiptap/tipTapToMarkdown'
import type {StandardMutation} from '../types/relayMutations'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'

interface OptimisticIntegrationFields {
  typename: string
  titleField: string
  bodyField: string
  bodyFormat: 'html' | 'markdown'
}

const optimisticIntegrationFields: Partial<
  Record<IntegrationProviderServiceEnum, OptimisticIntegrationFields>
> = {
  azureDevOps: {
    typename: 'AzureDevOpsWorkItem',
    titleField: 'title',
    bodyField: 'descriptionHTML',
    bodyFormat: 'html'
  },
  github: {
    typename: '_xGitHubIssue',
    titleField: 'title',
    bodyField: 'bodyHTML',
    bodyFormat: 'html'
  },
  gitlab: {
    typename: '_xGitLabIssue',
    titleField: 'title',
    bodyField: 'descriptionHtml',
    bodyFormat: 'html'
  },
  jira: {
    typename: 'JiraIssue',
    titleField: 'summary',
    bodyField: 'descriptionHTML',
    bodyFormat: 'html'
  },
  jiraServer: {
    typename: 'JiraServerIssue',
    titleField: 'summary',
    bodyField: 'descriptionHTML',
    bodyFormat: 'html'
  },
  linear: {
    typename: '_xLinearIssue',
    titleField: 'title',
    bodyField: 'description',
    bodyFormat: 'markdown'
  }
}

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
        ...TaskIntegrationLinkIntegrationGitHub @alias
        ...TaskIntegrationLinkIntegrationJira @alias
        ...TaskIntegrationLinkIntegrationJiraServer @alias
        ...TaskIntegrationLinkIntegrationGitLab @alias
        ...TaskIntegrationLinkIntegrationAzure @alias
        ...TaskIntegrationLinkIntegrationLinear @alias
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

const CreateTaskIntegrationMutation: StandardMutation<TCreateTaskIntegrationMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TCreateTaskIntegrationMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {taskId, integrationProviderService} = variables
      const task = store.get(taskId)
      const optimisticFields = optimisticIntegrationFields[integrationProviderService]
      const content = task?.getValue('content')
      if (!task || !optimisticFields || typeof content !== 'string') return
      const {typename, titleField, bodyField, bodyFormat} = optimisticFields
      const {title, bodyContent} = splitTipTapContent(JSON.parse(content))
      const body = !bodyContent
        ? ''
        : bodyFormat === 'markdown'
          ? tipTapToMarkdown(bodyContent)
          : generateHTML(bodyContent, serverTipTapExtensions)
      const integration = createProxyRecord(store, typename, {
        id: clientTempId(taskId),
        title,
        [titleField]: title,
        [bodyField]: body
      })
      task.setLinkedRecord(integration, 'integration')
      task.setValue(integrationProviderService, 'taskService')
    },
    onCompleted: (data, errors) => {
      if (onCompleted) {
        onCompleted(data, errors)
      }
    },
    onError
  })
}

export default CreateTaskIntegrationMutation
