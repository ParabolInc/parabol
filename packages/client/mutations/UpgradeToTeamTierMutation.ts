import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpgradeToTeamTierMutation as TUpgradeToTeamTierMutation} from '../__generated__/UpgradeToTeamTierMutation.graphql'

graphql`
  fragment UpgradeToTeamTierMutation_organization on UpgradeToTeamTierPayload {
    organization {
      creditCard {
        brand
        last4
        expiry
      }
      company {
        tier
      }
      tier
      periodEnd
      periodStart
      updatedAt
      lockedAt
    }
    meetings {
      showConversionModal
    }
  }
`

graphql`
  fragment UpgradeToTeamTierMutation_team on UpgradeToTeamTierPayload {
    teams {
      isPaid
      tier
    }
  }
`

const mutation = graphql`
  mutation UpgradeToTeamTierMutation($orgId: ID!, $stripeToken: ID!) {
    upgradeToTeamTier(orgId: $orgId, stripeToken: $stripeToken) {
      error {
        message
      }
      ...UpgradeToTeamTierMutation_organization @relay(mask: false)
      ...UpgradeToTeamTierMutation_team @relay(mask: false)
    }
  }
`

const UpgradeToTeamTierMutation: StandardMutation<TUpgradeToTeamTierMutation> = (
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

export default UpgradeToTeamTierMutation
