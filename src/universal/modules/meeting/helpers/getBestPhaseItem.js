export default function getBestPhaseItem(nextPhase, team) {
  const {facilitatorPhase, facilitatorPhaseItem, meetingPhase, meetingPhaseItem} = team;
  if (facilitatorPhase === nextPhase) {
    return facilitatorPhaseItem;
  } else if (meetingPhase === nextPhase) {
    return meetingPhaseItem;
  } else {
    return 1;
  }
}
