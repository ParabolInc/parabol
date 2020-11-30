import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {MessageAllSlackUsersMutation as TMessageAllSlackUsersMutation} from '../__generated__/MessageAllSlackUsersMutation.graphql'

const mutation = graphql`
  mutation MessageAllSlackUsersMutation($message: String!) {
    messageAllSlackUsers(message: $message) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on MessageAllSlackUsersSuccess {
        messagedUserIds
      }
    }
  }
`

const MessageAllSlackUsersMutation: StandardMutation<TMessageAllSlackUsersMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TMessageAllSlackUsersMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default MessageAllSlackUsersMutation
