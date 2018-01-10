import {LOBBY, CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL, SUMMARY, MEETING_SUMMARY_LABEL} from 'universal/utils/constants';

export default {
  [LOBBY]: {
    index: 0,
    name: 'Lobby',
    next: CHECKIN,
    route: 'lobby',
    visitOnce: true
  },
  [CHECKIN]: {
    index: 1,
    items: {
      arrayName: 'teamMembers'
    },
    name: 'Social Check-In',
    next: UPDATES,
    route: 'checkin',
    visitOnce: false
  },
  [UPDATES]: {
    index: 2,
    items: {
      arrayName: 'teamMembers'
    },
    name: 'Solo Updates',
    next: FIRST_CALL,
    route: 'updates',
    visitOnce: false
  },
  [FIRST_CALL]: {
    index: 3,
    name: 'First Call',
    next: AGENDA_ITEMS,
    route: 'firstcall',
    visitOnce: true
  },
  [AGENDA_ITEMS]: {
    index: 4,
    items: {
      arrayName: 'agendaItems'
    },
    name: 'Team Agenda',
    next: LAST_CALL,
    route: 'agenda',
    visitOnce: false
  },
  [LAST_CALL]: {
    index: 5,
    name: 'Last Call',
    next: SUMMARY,
    route: 'lastcall',
    visitOnce: true
  },
  [SUMMARY]: {
    index: 6,
    name: MEETING_SUMMARY_LABEL,
    route: 'summary',
    visitOnce: false
  }
};
