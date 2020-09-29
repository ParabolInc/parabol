import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {PersistJiraSearchQueryMutation as TPersistJiraSearchQueryMutation} from '../__generated__/PersistJiraSearchQueryMutation.graphql'

graphql`
  fragment PersistJiraSearchQueryMutation_team on PersistJiraSearchQuerySuccess {
    settings {
      jiraSearchQueries {
        id
        queryString
        isJQL
        projectKeyFilters
        issueTypeFilters
        lastUsedAt
      }
    }
  }
`

const mutation = graphql`
  mutation PersistJiraSearchQueryMutation($teamId: ID!, $input: JiraSearchQueryInput!) {
    persistJiraSearchQuery(teamId: $teamId, input: $input) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PersistJiraSearchQueryMutation_team @relay(mask: false)
    }
  }
`

const PersistJiraSearchQueryMutation: StandardMutation<TPersistJiraSearchQueryMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TPersistJiraSearchQueryMutation>(atmosphere, {
    mutation,
    variables,
    // TODO: Add optimistic updater
    // optimisticUpdater: (store) => {
    // },
    onCompleted,
    onError
  })
}

export default PersistJiraSearchQueryMutation
