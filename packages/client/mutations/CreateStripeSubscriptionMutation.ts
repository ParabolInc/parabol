import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {CreateStripeSubscriptionMutation as TCreateStripeSubscriptionMutation} from '../__generated__/CreateStripeSubscriptionMutation.graphql'

graphql`
  fragment CreateStripeSubscriptionMutation_organization on CreateStripeSubscriptionSuccess {
    stripeSubscriptionClientSecret
  }
`

const mutation = graphql`
  mutation CreateStripeSubscriptionMutation($orgId: ID!, $paymentMethodId: ID!) {
    createStripeSubscription(orgId: $orgId, paymentMethodId: $paymentMethodId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...CreateStripeSubscriptionMutation_organization @relay(mask: false)
    }
  }
`

const CreateStripeSubscriptionMutation: StandardMutation<TCreateStripeSubscriptionMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreateStripeSubscriptionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreateStripeSubscriptionMutation
