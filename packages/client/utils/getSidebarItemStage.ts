import findStageById from './meetings/findStageById'

interface Phase {
  phaseType: string
  stages: readonly {
    id: string
    isNavigable: boolean
    isNavigableByFacilitator: boolean
    isComplete: boolean
    readyCount?: number
  }[]
}

const getSidebarItemStage = <T extends readonly Phase[]>(
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
