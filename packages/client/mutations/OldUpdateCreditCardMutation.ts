import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {OldUpdateCreditCardMutation as TOldUpdateCreditCardMutation} from '../__generated__/OldUpdateCreditCardMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment OldUpdateCreditCardMutation_organization on OldUpdateCreditCardPayload {
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
  fragment OldUpdateCreditCardMutation_team on OldUpdateCreditCardPayload {
    teamsUpdated {
      isPaid
      updatedAt
    }
  }
`

const mutation = graphql`
  mutation OldUpdateCreditCardMutation($orgId: ID!, $stripeToken: ID!) {
    oldUpdateCreditCard(orgId: $orgId, stripeToken: $stripeToken) {
      error {
        message
      }
      ...OldUpdateCreditCardMutation_organization @relay(mask: false)
      ...OldUpdateCreditCardMutation_team @relay(mask: false)
    }
  }
`

const OldUpdateCreditCardMutation: StandardMutation<TOldUpdateCreditCardMutation> = (
  atmosphere,
  {orgId, stripeToken},
  {onError, onCompleted}
) => {
  return commitMutation<TOldUpdateCreditCardMutation>(atmosphere, {
    mutation,
    variables: {
      orgId,
      stripeToken
    },
    onCompleted,
    onError
  })
}

export default OldUpdateCreditCardMutation
