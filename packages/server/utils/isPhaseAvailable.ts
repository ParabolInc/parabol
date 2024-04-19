import isTeamHealthAvailable from 'parabol-client/utils/features/isTeamHealthAvailable'
import {NewMeetingPhaseTypeEnum} from '../database/types/GenericMeetingPhase'
import {TierEnum} from '../database/types/Invoice'

const isPhaseAvailable = (tier: TierEnum) => (phaseType: NewMeetingPhaseTypeEnum) => {
  if (phaseType === 'TEAM_HEALTH') {
    return isTeamHealthAvailable(tier)
  }
  return true
}

export default isPhaseAvailable
