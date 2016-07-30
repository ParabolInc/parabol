import {LOBBY} from 'universal/utils/constants';

export default function makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem) {
  const base = `/meeting/${teamId}/${facilitatorPhase}`;
  return facilitatorPhase === LOBBY ? base : `${base}/${facilitatorPhaseItem}`;
}
