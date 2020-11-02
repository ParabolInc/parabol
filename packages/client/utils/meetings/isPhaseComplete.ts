const isPhaseComplete = (phaseType: string, phases: ReadonlyArray<{phaseType: string, stages: ReadonlyArray<{isComplete: boolean}>}>) => {
  const phase = phases.find((p) => p.phaseType === phaseType)!
  return phase.stages.every((stage) => stage && stage.isComplete === true)
}

export default isPhaseComplete
