import {
  CHECKIN,
  UPDATES,
  AGENDA_ITEMS
} from 'universal/utils/constants';

export default function isLastItemOfPhase(phase, phaseItem, members, agenda) {
  if (phase === CHECKIN || phase === UPDATES) return phaseItem >= members.length;
  if (phase === AGENDA_ITEMS) return phaseItem >= agenda.length;
  return true; // phase only has one item (firstcall, lastcall, summary)
}
