import {commitMutation} from 'react-relay'

graphql`
  fragment UpgradeToProMutation_organization on UpgradeToProPayload {
    organization {
      creditCard {
        brand
        last4
        expiry
      }
      #don't request tier because we set that locally to allow for the animation to play
      periodEnd
      periodStart
      updatedAt
    }
  }
`

graphql`
  fragment UpgradeToProMutation_team on UpgradeToProPayload {
    teams {
      isPaid
      tier
    }
  }
`

const mutation = graphql`
  mutation UpgradeToProMutation($orgId: ID!, $stripeToken: ID!) {
    upgradeToPro(orgId: $orgId, stripeToken: $stripeToken) {
      error {
        message
      }
      ...UpgradeToProMutation_organization @relay(mask: false)
      ...UpgradeToProMutation_team @relay(mask: false)
    }
  }
`

const UpgradeToProMutation = (environment, orgId, stripeToken, onError, onCompleted) => {
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

export default UpgradeToProMutation
