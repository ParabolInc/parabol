import {LOBBY, CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL, SUMMARY} from 'universal/utils/constants';

export default {
  [LOBBY]: {
    index: 0,
    name: 'Lobby',
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
    route: 'updates',
    visitOnce: false,
  },
  [FIRST_CALL]: {
    index: 3,
    name: 'First call',
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
    route: 'agenda',
    visitOnce: false,
  },
  [LAST_CALL]: {
    index: 5,
    name: 'Last call',
    route: 'lastcall',
    visitOnce: true,
  },
  [SUMMARY]: {
    index: 6,
    name: 'Summary',
    route: 'summary',
    visitOnce: false,
  }
}
