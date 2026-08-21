import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {PersistIntegrationSearchQueryMutation as TPersistIntegrationSearchQueryMutation} from '../__generated__/PersistIntegrationSearchQueryMutation.graphql'
import type {SimpleMutation} from '../types/relayMutations'

graphql`
  fragment PersistIntegrationSearchQueryMutation_notification on PersistIntegrationSearchQuerySuccess {
    jiraServerIntegration {
      searchQueries {
        id
        queryString
        isJQL
        projectKeyFilters
      }
      sharedProviders {
        id
      }
    }
    atlassianIntegration {
      jiraSearchQueries {
        id
        queryString
        isJQL
        projectKeyFilters
        lastUsedAt
      }
    }
    githubIntegration {
      githubSearchQueries {
        id
        queryString
        lastUsedAt
      }
    }
  }
`

const mutation = graphql`
  mutation PersistIntegrationSearchQueryMutation(
    $teamId: ID!
    $service: IntegrationProviderServiceEnum!
    $providerId: ID
    $jiraServerSearchQuery: JiraServerSearchQueryInput
    $jiraSearchQuery: JiraSearchQueryInput
    $githubSearchQuery: GitHubSearchQueryInput
  ) {
    persistIntegrationSearchQuery(
      teamId: $teamId
      service: $service
      providerId: $providerId
      jiraServerSearchQuery: $jiraServerSearchQuery
      jiraSearchQuery: $jiraSearchQuery
      githubSearchQuery: $githubSearchQuery
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PersistIntegrationSearchQueryMutation_notification @relay(mask: false)
    }
  }
`

const PersistIntegrationSearchQueryMutation: SimpleMutation<
  TPersistIntegrationSearchQueryMutation
> = (atmosphere, variables) => {
  return commitMutation<TPersistIntegrationSearchQueryMutation>(atmosphere, {mutation, variables})
}

export default PersistIntegrationSearchQueryMutation
