interface Stage {
  id: string
}

export interface FindStageByIdPhase {
  stages: ReadonlyArray<Stage>
}

const findStageById = <T extends FindStageByIdPhase>(
  phases: ReadonlyArray<T> | null | undefined,
  stageId: string
) => {
  if (!phases) return undefined
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii]
    const {stages} = phase
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj] as T['stages'][0] & Stage
      if (stage.id === stageId) {
        return {phase, stage, stageIdx: jj}
      }
    }
  }
  return undefined
}

export default findStageById
