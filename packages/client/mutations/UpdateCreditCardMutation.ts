import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
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

const UpdateCreditCardMutation = (environment, orgId, stripeToken, onError, onCompleted) => {
  return commitMutation(environment, {
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
