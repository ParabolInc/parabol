import {TierEnum} from '~/../server/database/types/Invoice'

function isTeamHealthAvailable(tier: TierEnum, teamHealth?: boolean) {
  return tier !== 'starter' || teamHealth
}

export default isTeamHealthAvailable
