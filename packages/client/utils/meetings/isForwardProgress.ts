const isForwardProgress = (
  phases: readonly {stages: readonly {id: string}[]}[],
  stageId: string,
  nextStageId: string
) => {
  if (!phases || !stageId || !nextStageId) return false
  let stageFound = false
  for (let ii = 0; ii < phases.length; ii++) {
    const phase = phases[ii]!
    const {stages} = phase
    for (let jj = 0; jj < stages.length; jj++) {
      const stage = stages[jj]!
      if (stageFound === true && stage.id === nextStageId) {
        return true
      }
      if (stage.id === stageId) {
        stageFound = true
      }
    }
  }
  return false
}

export default isForwardProgress
