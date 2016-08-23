import {FIRST_CALL, LAST_CALL, AGENDA_ITEMS} from 'universal/utils/constants';

export default function (phase) {
  return phase === FIRST_CALL || phase === LAST_CALL || phase === AGENDA_ITEMS;
}
