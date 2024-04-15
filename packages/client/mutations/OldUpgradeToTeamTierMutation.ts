import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {OldUpgradeToTeamTierMutation as TOldUpgradeToTeamTierMutation} from '../__generated__/OldUpgradeToTeamTierMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment OldUpgradeToTeamTierMutation_organization on OldUpgradeToTeamTierPayload {
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
  fragment OldUpgradeToTeamTierMutation_team on OldUpgradeToTeamTierPayload {
    teams {
      isPaid
      tier
    }
  }
`

const mutation = graphql`
  mutation OldUpgradeToTeamTierMutation($orgId: ID!, $stripeToken: ID!) {
    oldUpgradeToTeamTier(orgId: $orgId, stripeToken: $stripeToken) {
      error {
        message
      }
      ...OldUpgradeToTeamTierMutation_organization @relay(mask: false)
      ...OldUpgradeToTeamTierMutation_team @relay(mask: false)
    }
  }
`

const OldUpgradeToTeamTierMutation: StandardMutation<TOldUpgradeToTeamTierMutation> = (
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

export default OldUpgradeToTeamTierMutation
