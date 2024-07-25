import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {UpdateCreditCardMutation as TUpdateCreditCardMutation} from '../__generated__/UpdateCreditCardMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpdateCreditCardMutation_organization on UpdateCreditCardSuccess {
    stripeSubscriptionClientSecret
    organization {
      id
      creditCard {
        brand
        last4
        expiry
      }
      updatedAt
    }
  }
`

graphql`
  fragment UpdateCreditCardMutation_team on UpdateCreditCardSuccess {
    teamsUpdated {
      isPaid
      updatedAt
    }
  }
`

const mutation = graphql`
  mutation UpdateCreditCardMutation($orgId: ID!, $paymentMethodId: ID!) {
    updateCreditCard(orgId: $orgId, paymentMethodId: $paymentMethodId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateCreditCardMutation_organization @relay(mask: false)
      ...UpdateCreditCardMutation_team @relay(mask: false)
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
    onCompleted,
    onError
  })
}

export default UpdateCreditCardMutation
