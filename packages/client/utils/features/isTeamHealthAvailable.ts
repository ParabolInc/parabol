import {TierEnum} from '../../__generated__/DowngradeToStarterMutation.graphql'

function isTeamHealthAvailable(tier: TierEnum) {
  return tier !== 'starter'
}

export default isTeamHealthAvailable
