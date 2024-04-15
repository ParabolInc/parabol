import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {PersistGitHubSearchQueryMutation as TPersistGitHubSearchQueryMutation} from '../__generated__/PersistGitHubSearchQueryMutation.graphql'
import {SimpleMutation} from '../types/relayMutations'

graphql`
  fragment PersistGitHubSearchQueryMutation_notification on PersistGitHubSearchQuerySuccess {
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
  mutation PersistGitHubSearchQueryMutation(
    $teamId: ID!
    $queryString: String!
    $isRemove: Boolean
  ) {
    persistGitHubSearchQuery(teamId: $teamId, queryString: $queryString, isRemove: $isRemove) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PersistGitHubSearchQueryMutation_notification @relay(mask: false)
    }
  }
`

const PersistGitHubSearchQueryMutation: SimpleMutation<TPersistGitHubSearchQueryMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TPersistGitHubSearchQueryMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default PersistGitHubSearchQueryMutation
