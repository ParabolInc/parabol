import GenericMeetingPhase from '~/../server/database/types/GenericMeetingPhase'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'

const unlockAllStagesForPhase = (
  phases: GenericMeetingPhase[],
  phaseType: NewMeetingPhaseTypeEnum,
  isForFacilitator: boolean,
  isUnlock = true
) => {
  const field = isForFacilitator ? 'isNavigableByFacilitator' : 'isNavigable'
  const phase = phases.find((p) => p.phaseType === phaseType)
  if (!phase) return []
  const {stages} = phase
  // mutates the phase object
  stages.forEach((stage) => {
    stage[field] = isUnlock
  })
  return stages.map(({id}) => id)
}

export default unlockAllStagesForPhase
