import {FindStageByIdPhase} from './findStageById'

const findStageBeforeId = <T extends FindStageByIdPhase>(
  phases: readonly T[] | null | undefined,
  stageId: string
) => {
  if (!phases) return undefined
  let stageFound = false
  for (let ii = phases.length - 1; ii >= 0; ii--) {
    const phase = phases[ii]!
    const {stages} = phase
    for (let jj = stages.length - 1; jj >= 0; jj--) {
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

export default findStageBeforeId
