import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RefreshPokerEstimateIntegrationMutation as TRefreshPokerEstimateIntegrationMutation} from '../__generated__/RefreshPokerEstimateIntegrationMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment RefreshPokerEstimateIntegrationMutation_task on Task {
    ...PokerEstimateHeaderCardParabol_task
    integrationHash
    integration {
      ... on AzureDevOpsWorkItem {
        __typename
        id
        title
        teamProject
        type
        state
        url
        descriptionHTML
      }
      ... on JiraIssue {
        __typename
        issueKey
        summary
        descriptionHTML
        jiraUrl: url
      }
      ... on JiraServerIssue {
        __typename
        issueKey
        summary
        descriptionHTML
        jiraUrl: url
      }
      ... on _xGitHubIssue {
        __typename
        number
        title
        bodyHTML
        ghUrl: url
      }
      ... on _xGitLabIssue {
        __typename
        descriptionHtml
        title
        webUrl
        iid
      }
      ... on _xLinearIssue {
        __typename
        description
        title
        url
        identifier
      }
    }
  }
`

const mutation = graphql`
  mutation RefreshPokerEstimateIntegrationMutation($taskId: ID!, $meetingId: ID!) {
    refreshPokerEstimateIntegration(taskId: $taskId, meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on RefreshPokerEstimateIntegrationSuccess {
        task {
          ...RefreshPokerEstimateIntegrationMutation_task @relay(mask: false)
        }
      }
    }
  }
`

const RefreshPokerEstimateIntegrationMutation: StandardMutation<
  TRefreshPokerEstimateIntegrationMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TRefreshPokerEstimateIntegrationMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RefreshPokerEstimateIntegrationMutation
