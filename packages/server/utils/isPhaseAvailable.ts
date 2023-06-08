import {TierEnum} from '../database/types/Invoice'
import {NewMeetingPhaseTypeEnum} from '../database/types/GenericMeetingPhase'

const isPhaseAvailable = (tier: TierEnum) => (phaseType: NewMeetingPhaseTypeEnum) => {
  if (phaseType === 'TEAM_HEALTH') {
    return tier !== 'starter'
  }
  return true
}

export default isPhaseAvailable
