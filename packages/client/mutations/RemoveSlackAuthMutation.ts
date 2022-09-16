import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {RemoveSlackAuthMutation as TRemoveSlackAuthMutation} from '../__generated__/RemoveSlackAuthMutation.graphql'

graphql`
  fragment RemoveSlackAuthMutation_team on RemoveSlackAuthPayload {
    user {
      ...SlackProviderRowViewer @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation RemoveSlackAuthMutation($teamId: ID!) {
    removeSlackAuth(teamId: $teamId) {
      error {
        message
      }
      ...RemoveSlackAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveSlackAuthMutation: StandardMutation<TRemoveSlackAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveSlackAuthMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default RemoveSlackAuthMutation
