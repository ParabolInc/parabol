import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateCreditCardMutation as TUpdateCreditCardMutation} from '../__generated__/UpdateCreditCardMutation.graphql'

graphql`
  fragment UpdateCreditCardMutation_part on UpdateCreditCardSuccess {
    successField
  }
`

const mutation = graphql`
  mutation UpdateCreditCardMutation($arg1: ID!) {
    updateCreditCard(arg1: $arg1) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateCreditCardMutation_part @relay(mask: false)
    }
  }
`

const UpdateCreditCardMutation: StandardMutation<TUpdateCreditCardMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateCreditCardMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {} = variables
    },
    onCompleted,
    onError
  })
}

export default UpdateCreditCardMutation
