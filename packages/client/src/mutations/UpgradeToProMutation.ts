import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {UpgradeToProMutation as TUpgradeToProMutation} from '../__generated__/UpgradeToProMutation.graphql'

graphql`
  fragment UpgradeToProMutation_organization on UpgradeToProPayload {
    organization {
      creditCard {
        brand
        last4
        expiry
      }
      tier
      periodEnd
      periodStart
      updatedAt
    }
    meetings {
      showConversionModal
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

const UpgradeToProMutation: StandardMutation<TUpgradeToProMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpgradeToProMutation
