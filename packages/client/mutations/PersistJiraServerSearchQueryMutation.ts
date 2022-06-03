import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {PersistJiraServerSearchQueryMutation as TPersistJiraServerSearchQueryMutation} from '../__generated__/PersistJiraServerSearchQueryMutation.graphql'

graphql`
  fragment PersistJiraServerSearchQueryMutation_notification on PersistIntegrationSearchQuerySuccess {
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
  }
`

const mutation = graphql`
  mutation PersistJiraServerSearchQueryMutation(
    $teamId: ID!
    $providerId: ID
    $jiraServerSearchQuery: JiraServerSearchQueryInput
  ) {
    persistIntegrationSearchQuery(
      teamId: $teamId
      service: jiraServer
      providerId: $providerId
      jiraServerSearchQuery: $jiraServerSearchQuery
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PersistJiraServerSearchQueryMutation_notification @relay(mask: false)
    }
  }
`

const PersistJiraServerSearchQueryMutation: SimpleMutation<
  TPersistJiraServerSearchQueryMutation
> = (atmosphere, variables) => {
  return commitMutation<TPersistJiraServerSearchQueryMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default PersistJiraServerSearchQueryMutation
