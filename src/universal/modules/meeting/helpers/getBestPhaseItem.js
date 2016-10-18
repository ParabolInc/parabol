export default function getBestPhaseItem(nextPhase, team) {
  const {facilitatorPhase, facilitatorPhaseItem, meetingPhase, meetingPhaseItem} = team;
  if (facilitatorPhase === nextPhase) {
    return facilitatorPhaseItem;
  }
  if (meetingPhase === nextPhase) {
    return meetingPhaseItem;
  }
  return 1;
}
