import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {CreatePaymentIntentMutation as TCreatePaymentIntentMutation} from '../__generated__/CreatePaymentIntentMutation.graphql'

const mutation = graphql`
  mutation CreatePaymentIntentMutation {
    createPaymentIntent {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on CreatePaymentIntentSuccess {
        clientSecret
      }
    }
  }
`

const CreatePaymentIntentMutation: StandardMutation<TCreatePaymentIntentMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreatePaymentIntentMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreatePaymentIntentMutation
