import {LOBBY, CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL, SUMMARY} from 'universal/utils/constants';

export default {
  [LOBBY]: {
    index: 0,
    name: 'Lobby',
    next: CHECKIN,
    route: 'lobby',
    visitOnce: true,
  },
  [CHECKIN]: {
    index: 1,
    items: {
      countName: 'teamMemberCount',
      arrayName: 'members'
    },
    name: 'Check-in',
    next: UPDATES,
    route: 'checkin',
    visitOnce: false,
  },
  [UPDATES]: {
    index: 2,
    items: {
      countName: 'teamMemberCount',
      arrayName: 'members'
    },
    name: 'Updates',
    next: FIRST_CALL,
    route: 'updates',
    visitOnce: false,
  },
  [FIRST_CALL]: {
    index: 3,
    name: 'First call',
    next: AGENDA_ITEMS,
    route: 'firstcall',
    visitOnce: true,
  },
  [AGENDA_ITEMS]: {
    index: 4,
    items: {
      countName: 'agendaCount',
      arrayName: 'agenda'
    },
    name: 'Agenda items',
    next: LAST_CALL,
    route: 'agenda',
    visitOnce: false,
  },
  [LAST_CALL]: {
    index: 5,
    name: 'Last call',
    next: SUMMARY,
    route: 'lastcall',
    visitOnce: true,
  },
  [SUMMARY]: {
    index: 6,
    name: 'Summary',
    route: 'summary',
    visitOnce: false,
  }
};
