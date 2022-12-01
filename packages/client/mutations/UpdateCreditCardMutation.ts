import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateCreditCardMutation as TUpdateCreditCardMutation} from '../__generated__/UpdateCreditCardMutation.graphql'
graphql`
  fragment UpdateCreditCardMutation_organization on UpdateCreditCardPayload {
    organization {
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
  fragment UpdateCreditCardMutation_team on UpdateCreditCardPayload {
    teamsUpdated {
      isPaid
      updatedAt
    }
  }
`

const mutation = graphql`
  mutation UpdateCreditCardMutation($orgId: ID!, $stripeToken: ID!) {
    updateCreditCard(orgId: $orgId, stripeToken: $stripeToken) {
      error {
        message
      }
      ...UpdateCreditCardMutation_organization @relay(mask: false)
      ...UpdateCreditCardMutation_team @relay(mask: false)
    }
  }
`

const UpdateCreditCardMutation: StandardMutation<TUpdateCreditCardMutation> = (
  atmosphere,
  {orgId, stripeToken},
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateCreditCardMutation>(atmosphere, {
    mutation,
    variables: {
      orgId,
      stripeToken
    },
    onCompleted,
    onError
  })
}

export default UpdateCreditCardMutation
