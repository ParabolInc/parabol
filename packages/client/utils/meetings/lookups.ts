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
} from '../constants'

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

export const phaseIconLookup = {
  [CHECKIN]: 'group',
  [REFLECT]: 'edit',
  [GROUP]: 'group_work',
  [VOTE]: 'thumbs_up_down',
  [DISCUSS]: 'comment',
  [UPDATES]: 'update',
  [FIRST_CALL]: 'comment',
  [AGENDA_ITEMS]: 'comment',
  [LAST_CALL]: 'comment'
}

export const meetingTypeToIcon = {
  [RETROSPECTIVE]: 'history',
  [ACTION]: 'change_history'
} as const

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
