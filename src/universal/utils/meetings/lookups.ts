import {
  ACTION,
  AGENDA_ITEMS,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  REFLECT,
  RETROSPECTIVE,
  UPDATES,
  VOTE
} from 'universal/utils/constants'

/* Used by the server! cannot convert to enums yet */

/* These are the labels show to the viewer */
export const phaseLabelLookup = {
  [CHECKIN]: 'Social Check-In',
  [REFLECT]: 'Reflect',
  [GROUP]: 'Group',
  [VOTE]: 'Vote',
  [DISCUSS]: 'Discuss',
  [UPDATES]: 'Solo Updates',
  [FIRST_CALL]: 'First Call',
  [AGENDA_ITEMS]: 'Team Agenda',
  [LAST_CALL]: 'Last Call'
}

export const meetingTypeToSlug = {
  [RETROSPECTIVE]: 'retro',
  [ACTION]: 'meeting'
}

export const meetingTypeToLabel = {
  [RETROSPECTIVE]: 'Retrospective',
  [ACTION]: 'Action'
}

export const phaseTypeToSlug = {
  [CHECKIN]: 'checkin',
  [REFLECT]: 'reflect',
  [GROUP]: 'group',
  [VOTE]: 'vote',
  [DISCUSS]: 'discuss',
  [UPDATES]: 'updates',
  [FIRST_CALL]: 'firstcall',
  [AGENDA_ITEMS]: 'agendaitems',
  [LAST_CALL]: 'lastcall'
}
