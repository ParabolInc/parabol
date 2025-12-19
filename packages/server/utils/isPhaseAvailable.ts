import isTeamHealthAvailable from 'parabol-client/utils/features/isTeamHealthAvailable'
import type {TierEnum} from '../graphql/public/resolverTypes'
import type {Newmeetingphasetypeenum} from '../postgres/types/pg'

const isPhaseAvailable = (tier: TierEnum) => (phaseType: Newmeetingphasetypeenum) => {
  if (phaseType === 'TEAM_HEALTH') {
    return isTeamHealthAvailable(tier)
  }
  return true
}

export default isPhaseAvailable
