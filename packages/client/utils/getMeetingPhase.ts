import findStageById from './meetings/findStageById'

interface Phase {
  stages: ReadonlyArray<{
    id: string
    isComplete: boolean
  }>
}

const getMeetingPhase = <T extends Phase>(phases: readonly T[], facilitatorStageId?: string) => {
  if (facilitatorStageId) {
    const facilitatorStage = findStageById(phases, facilitatorStageId)
    if (facilitatorStage) {
      return facilitatorStage.phase
    }
  }

  const lastPhaseInProgress = phases
    .filter((phase) => phase.stages.some((stage) => stage.isComplete))
    .at(-1)

  if (!lastPhaseInProgress || lastPhaseInProgress.stages.every((stage) => stage.isComplete)) {
    return phases.find((phase) => !phase.stages.some((stage) => stage.isComplete))
  }
  return lastPhaseInProgress
}

export default getMeetingPhase
