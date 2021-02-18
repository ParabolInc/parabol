import {
  RemoveSlackAuthMutation as TRemoveSlackAuthMutation,
  RemoveSlackAuthMutationVariables
} from '../__generated__/RemoveSlackAuthMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {LocalHandlers} from '../types/relayMutations'

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

const RemoveSlackAuthMutation = (
  atmosphere: Atmosphere,
  variables: RemoveSlackAuthMutationVariables,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TRemoveSlackAuthMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default RemoveSlackAuthMutation
