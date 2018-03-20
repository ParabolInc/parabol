const isPhaseComplete = (phaseType, phases) => {
  const phase = phases.find((phase) => phase.phaseType === phaseType);
  return phase.stages.every((stage) => stage && stage.isComplete === true);
};

export default isPhaseComplete;
