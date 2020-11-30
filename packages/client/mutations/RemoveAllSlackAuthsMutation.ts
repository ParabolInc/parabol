import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {RemoveAllSlackAuthsMutation as TRemoveAllSlackAuthsMutation} from '../__generated__/RemoveAllSlackAuthsMutation.graphql'

const mutation = graphql`
  mutation RemoveAllSlackAuthsMutation {
    removeAllSlackAuths {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on RemoveAllSlackAuthsSuccess {
        slackAuthRes
        slackNotificationRes
      }
    }
  }
`

const RemoveAllSlackAuthsMutation: StandardMutation<TRemoveAllSlackAuthsMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveAllSlackAuthsMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RemoveAllSlackAuthsMutation
