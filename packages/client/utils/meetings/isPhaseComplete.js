const isPhaseComplete = (phaseType, phases) => {
  const phase = phases.find((p) => p.phaseType === phaseType)
  return phase.stages.every((stage) => stage && stage.isComplete === true)
}

export default isPhaseComplete
