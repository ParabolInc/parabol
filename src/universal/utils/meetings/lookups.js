import {
  ACTION,
  AGENDA_ITEMS, CHECKIN, DISCUSS, FIRST_CALL, GROUP, LAST_CALL, LOBBY, RETROSPECTIVE, SUMMARY, REFLECT, UPDATES,
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
  [REFLECT]: REFLECT,
  [GROUP]: GROUP,
  [VOTE]: VOTE,
  [DISCUSS]: DISCUSS
};

/* These are the labels show to the viewer */
export const phaseLabelLookup = {
  [CHECKIN]: 'Social Check-In',
  [REFLECT]: 'Reflect',
  [GROUP]: 'Theme',
  [VOTE]: 'Vote',
  [DISCUSS]: 'Discuss',
  [UPDATES]: 'Solo Updates',
  [FIRST_CALL]: 'First Call',
  [AGENDA_ITEMS]: 'Team Agenda',
  [LAST_CALL]: 'Last Call'
};

export const phaseDescriptionLookup = {
  [REFLECT]: 'Looking back to move forward',
  [GROUP]: 'Drag cards to group them by common themes',
  [VOTE]: 'Vote on the themes you want to discuss',
  [DISCUSS]: 'Create task cards to capture next steps'
};

export const meetingTypeToSlug = {
  [RETROSPECTIVE]: 'retro',
  [ACTION]: 'meeting'
};

export const meetingTypeToLabel = {
  [RETROSPECTIVE]: 'Retrospective',
  [ACTION]: 'Action'
};

export const phaseTypeToSlug = {
  [CHECKIN]: 'checkin',
  [REFLECT]: 'reflect',
  [GROUP]: 'theme',
  [VOTE]: 'vote',
  [DISCUSS]: 'discuss'
};

export const phaseIsMultiStage = {
  [CHECKIN]: true,
  [REFLECT]: false,
  [GROUP]: false,
  [VOTE]: false,
  [DISCUSS]: true
};
