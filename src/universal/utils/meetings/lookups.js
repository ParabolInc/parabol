import {
  AGENDA_ITEMS, CHECKIN, DISCUSS, FIRST_CALL, GROUP, LAST_CALL, LOBBY, SUMMARY, THINK, UPDATES,
  VOTE
} from 'universal/utils/constants';

/* Groups used for equality and navigation purposes. Could probably be refactored, but I'm not sure the best way */
export const phaseTypeToPhaseGroup = {
  [LOBBY]: LOBBY,
  [CHECKIN]: CHECKIN,
  [UPDATES]: UPDATES,
  [FIRST_CALL]: AGENDA_ITEMS,
  [AGENDA_ITEMS]: AGENDA_ITEMS,
  [LAST_CALL]: AGENDA_ITEMS,
  [SUMMARY]: SUMMARY,
  [THINK]: THINK,
  [GROUP]: GROUP,
  [VOTE]: VOTE,
  [DISCUSS]: DISCUSS
};

/* These are excluded from the sidebar */
export const phasesToExclude = [LOBBY, SUMMARY];

/* These are the labels show to the viewer*/
export const phaseLabelLookup = {
  [CHECKIN]: 'Social Check-In',
  [THINK]: 'Reflect',
  [GROUP]: 'Theme',
  [VOTE]: 'Vote',
  [DISCUSS]: 'Discuss'
};
