import {INewMeetingPhase, NewMeetingPhaseTypeEnum} from 'universal/types/gql'

const unlockAllStagesForPhase = (
  phases: Array<INewMeetingPhase>,
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
