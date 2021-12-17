import {FindStageByIdPhase} from './findStageById'

const findStageAfterId = <T extends FindStageByIdPhase>(
  phases: readonly T[] | null | undefined,
  stageId: string
) => {
  if (!phases) return undefined
  let stageFound = false
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii]!
    const {stages} = phase
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj]!
      if (stageFound) {
        return {phase, stage}
      }
      if (stage.id === stageId) {
        stageFound = true
      }
    }
  }
  return undefined
}

export default findStageAfterId
