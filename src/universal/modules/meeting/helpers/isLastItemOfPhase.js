import hasPhaseItem from './hasPhaseItem';
import {CHECKIN, UPDATES, AGENDA_ITEMS} from 'universal/utils/constants';

export default function isLastItemOfPhase(phase, phaseItem, members, agenda) {
  if (!hasPhaseItem(phase)) return true;
  if (phase === CHECKIN || phase === UPDATES) return phaseItem >= members.length;
  if (phase === AGENDA_ITEMS) return phaseItem >= agenda.length;
  // Should never get here
  return false;
}
