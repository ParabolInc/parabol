import GenericMeetingPhase from 'parabol-server/database/types/GenericMeetingPhase'

const unlockAllStagesForPhase = (
  phases: GenericMeetingPhase[],
  phaseType: any,
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
