import {TierEnum} from '../database/types/Invoice'
import {NewMeetingPhaseTypeEnum} from '../database/types/GenericMeetingPhase'
import isTeamHealthAvailable from 'parabol-client/utils/features/isTeamHealthAvailable'

const isPhaseAvailable = (tier: TierEnum) => (phaseType: NewMeetingPhaseTypeEnum) => {
  if (phaseType === 'TEAM_HEALTH') {
    return isTeamHealthAvailable(tier)
  }
  return true
}

export default isPhaseAvailable
