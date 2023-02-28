export interface FindStageByIdStage {
  id: string
  isComplete: boolean
  isNavigable: boolean
}

export interface FindStageByIdPhase<T extends FindStageByIdStage> {
  stages: readonly T[]
}

// first open stage that is navigable or last completed stage that is navigable
const findBestNavigableStage = <U extends FindStageByIdStage, T extends FindStageByIdPhase<U>>(
  phases: T[] | readonly T[] | null | undefined
) => {
  if (!phases) {
    return undefined
  }

  let lastClosed:
    | {
        phase: T
        stage: T['stages'][0]
        stageIdx: number
      }
    | undefined = undefined

  for (let i = 0; i < phases.length; ++i) {
    const phase = phases[i]!
    const {stages} = phase

    for (let j = 0; j < stages.length; ++j) {
      const stage = stages[j] as T['stages'][0]
      if (!stage.isNavigable) {
        continue
      }
      if (!stage.isComplete) {
        return {phase, stage, stageIdx: j}
      } else {
        lastClosed = {
          phase,
          stage,
          stageIdx: j
        }
      }
    }
  }
  return lastClosed
}

export default findBestNavigableStage
