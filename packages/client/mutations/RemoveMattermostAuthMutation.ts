import {RemoveMattermostAuthMutation as TRemoveMattermostAuthMutation} from '../__generated__/RemoveMattermostAuthMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment RemoveMattermostAuthMutation_team on RemoveMattermostAuthPayload {
    user {
      ...MattermostProviderRowViewer @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation RemoveMattermostAuthMutation($teamId: ID!) {
    removeMattermostAuth(teamId: $teamId) {
      error {
        message
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
    onError,
    onCompleted
  })
}

export default RemoveMattermostAuthMutation
