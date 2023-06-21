import {TierEnum} from '~/../server/database/types/Invoice'

function isTeamHealthAvailable(_tier: TierEnum) {
  // we're making it free for all for the beginning
  //return tier !== 'starter'
  return true
}

export default isTeamHealthAvailable
