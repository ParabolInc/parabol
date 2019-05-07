import findStageById from 'universal/utils/meetings/findStageById'

interface Phase {
  phaseType: string
  stages: ReadonlyArray<{
    id: string
    isNavigable: boolean
    isNavigableByFacilitator: boolean
  }>
}

const getSidebarItemStage = <T extends ReadonlyArray<Phase>>(
  name: string,
  phases: T,
  facilitatorStageId: string
) => {
  const stageRes = findStageById(phases, facilitatorStageId)
  if (!stageRes) return undefined
  const {stage, phase} = stageRes
  if (phase.phaseType === name) {
    return stage
  }
  const itemPhase = phases.find(({phaseType}) => phaseType === name)
  return itemPhase && itemPhase.stages[0]
}

export default getSidebarItemStage
