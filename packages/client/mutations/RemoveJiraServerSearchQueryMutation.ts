import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {RemoveJiraServerSearchQueryMutation as TRemoveJiraServerSearchQueryMutation} from '../__generated__/RemoveJiraServerSearchQueryMutation.graphql'

graphql`
  fragment RemoveJiraServerSearchQueryMutation_notification on RemoveIntegrationSearchQuerySuccess {
    jiraServerIntegration {
      searchQueries {
        id
        queryString
        isJQL
        projectKeyFilters
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveJiraServerSearchQueryMutation($id: ID!, $teamId: ID!) {
    removeIntegrationSearchQuery(id: $id, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RemoveJiraServerSearchQueryMutation_notification @relay(mask: false)
    }
  }
`

const RemoveJiraServerSearchQueryMutation: SimpleMutation<TRemoveJiraServerSearchQueryMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TRemoveJiraServerSearchQueryMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default RemoveJiraServerSearchQueryMutation
