import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {RemoveMattermostAuthMutation as TRemoveMattermostAuthMutation} from '../__generated__/RemoveMattermostAuthMutation.graphql'

graphql`
  fragment RemoveMattermostAuthMutation_team on RemoveMattermostAuthSuccess {
    user {
      ...MattermostProviderRow_viewer @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation RemoveMattermostAuthMutation($teamId: ID!) {
    removeMattermostAuth(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RemoveMattermostAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveMattermostAuthMutation: StandardMutation<TRemoveMattermostAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveMattermostAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RemoveMattermostAuthMutation
