import {TierEnum} from '~/../server/database/types/Invoice'

function isTeamHealthAvailable(tier: TierEnum) {
  return tier !== 'starter'
}

export default isTeamHealthAvailable
