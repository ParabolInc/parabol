import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {PersistGitHubQueryMutation as TPersistGitHubQueryMutation} from '../__generated__/PersistGitHubQueryMutation.graphql'

graphql`
  fragment PersistGitHubQueryMutation_notification on PersistGitHubQuerySuccess {
    githubIntegration {
      githubSearchQueries {
        queryString
        lastUsedAt
      }
    }
  }
`

const mutation = graphql`
  mutation PersistGitHubQueryMutation($teamId: ID!, $input: String!, $isRemove: Boolean) {
    persistGitHubQuery(teamId: $teamId, input: $input, isRemove: $isRemove) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PersistGitHubQueryMutation_notification @relay(mask: false)
    }
  }
`

const PersistGitHubQueryMutation: SimpleMutation<TPersistGitHubQueryMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TPersistGitHubQueryMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default PersistGitHubQueryMutation
