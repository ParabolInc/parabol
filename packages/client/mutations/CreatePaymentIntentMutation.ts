import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {CreatePaymentIntentMutation as TCreatePaymentIntentMutation} from '../__generated__/CreatePaymentIntentMutation.graphql'

// graphql`
//   fragment CreatePaymentIntentMutation_part on CreatePaymentIntentSuccess {
//     successField
//   }
// `

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
// ...CreatePaymentIntentMutation_part @relay(mask: false)

const CreatePaymentIntentMutation: StandardMutation<TCreatePaymentIntentMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreatePaymentIntentMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {} = variables
    },
    onCompleted,
    onError
  })
}

export default CreatePaymentIntentMutation
