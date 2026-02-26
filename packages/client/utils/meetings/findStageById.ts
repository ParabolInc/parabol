export interface FindStageByIdStage {
  id: string
}

export interface FindStageByIdPhase {
  stages: readonly FindStageByIdStage[]
}

const findStageById = <T extends FindStageByIdPhase>(
  phases: T[] | readonly T[] | null | undefined,
  foreignKey: string | undefined,
  stageKey = 'id'
) => {
  if (!phases || foreignKey === undefined) return undefined
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii]!
    const {stages} = phase
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj] as T['stages'][number] & FindStageByIdStage
      if (stage[stageKey as keyof typeof stage] === foreignKey) {
        return {phase, stage, stageIdx: jj}
      }
    }
  }
  return undefined
}

export default findStageById
