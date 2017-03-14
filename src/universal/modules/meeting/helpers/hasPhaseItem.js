import {CHECKIN, UPDATES, AGENDA_ITEMS} from 'universal/utils/constants';

export default function hasPhaseItem(phase) {
  return phase === CHECKIN || phase === UPDATES || phase === AGENDA_ITEMS;
}
