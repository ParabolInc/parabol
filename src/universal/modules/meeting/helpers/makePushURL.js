import {LOBBY} from 'universal/utils/constants';
import hasPhaseItem from './hasPhaseItem';

const safePhaseItem = (phaseItem) => {
  if (phaseItem <= 0 || isNaN(phaseItem)) {
    return 1;
  }
  return phaseItem;
};

export default function makePushURL(teamId, phase = LOBBY, maybePhaseItem) {
  const phaseItem = hasPhaseItem(phase) ? safePhaseItem(maybePhaseItem) : '';

  return `/meeting/${teamId}/${phase}/${phaseItem}`;
}
