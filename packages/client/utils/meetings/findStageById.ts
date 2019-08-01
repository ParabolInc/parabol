export interface FindStageByIdStage {
  id: string
}

export interface FindStageByIdPhase {
  stages: readonly FindStageByIdStage[]
}

const findStageById = <T extends FindStageByIdPhase>(
  phases: readonly T[] | null | undefined,
  foreginKey: string,
  stageKey: string = 'id'
) => {
  if (!phases) return undefined
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii]
    const {stages} = phase
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj] as T['stages'][0] & FindStageByIdStage
      if (stage[stageKey] === foreginKey) {
        return {phase, stage, stageIdx: jj}
      }
    }
  }
  return undefined
}

export default findStageById
