import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpgradeToTeamTierMutation as TUpgradeToTeamTierMutation} from '../__generated__/UpgradeToTeamTierMutation.graphql'

graphql`
  fragment UpgradeToTeamTierMutation_organization on UpgradeToTeamTierSuccess {
    organization {
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
  fragment UpgradeToTeamTierMutation_team on UpgradeToTeamTierSuccess {
    teams {
      isPaid
      tier
    }
  }
`

const mutation = graphql`
  mutation UpgradeToTeamTierMutation($orgId: ID!) {
    upgradeToTeamTier(orgId: $orgId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpgradeToTeamTierMutation_team @relay(mask: false)
      ...UpgradeToTeamTierMutation_organization @relay(mask: false)
    }
  }
`

const UpgradeToTeamTierMutation: StandardMutation<TUpgradeToTeamTierMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpgradeToTeamTierMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpgradeToTeamTierMutation
