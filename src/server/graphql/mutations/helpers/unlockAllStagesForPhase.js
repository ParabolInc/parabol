const unlockAllStagesForPhase = (phases, phaseType, isForFacilitator, lockValue = true) => {
  const field = isForFacilitator ? 'isNavigableByFacilitator' : 'isNavigable';
  const phase = phases.find((p) => p.phaseType === phaseType);
  const {stages} = phase;
  stages.forEach((stage) => stage[field] = lockValue);
  return stages.map(({id}) => id);
}

export default unlockAllStagesForPhase;
