import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {CreateTaskIntegrationMutation as TCreateTaskIntegrationMutation} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'
import getMeetingPathParams from '../utils/meetings/getMeetingPathParams'
import SendClientSideEvent from '../utils/SendClientSideEvent'

graphql`
  fragment CreateTaskIntegrationMutation_task on CreateTaskIntegrationPayload {
    task {
      ...IntegratedTaskContent_task
      integration {
        __typename
        ... on JiraIssue {
          service
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
          service
          bodyHTML
          title
          number
          repository {
            nameWithOwner
          }
        }
        ... on JiraServerIssue {
          service
          descriptionHTML
          summary
        }
        ... on _xGitLabIssue {
          service
          descriptionHtml
          title
          iid
          webPath
          webUrl
        }
        ... on AzureDevOpsWorkItem {
          __typename
          service
          id
          teamProject
          title
          url
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

const CreateTaskIntegrationMutation: StandardMutation<TCreateTaskIntegrationMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TCreateTaskIntegrationMutation>(atmosphere, {
    mutation,
    variables,
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
