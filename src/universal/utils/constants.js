/* Phases */
export const LOBBY = 'lobby';
export const CHECKIN = 'checkin';
export const UPDATES = 'updates';
export const AGENDA = 'agenda';
export const SUMMARY = 'summary';
export const phaseArray = [LOBBY, CHECKIN, UPDATES, AGENDA, SUMMARY];
export const phaseOrder = phase => phaseArray.indexOf(phase);

/* Columns */
export const ACTIVE = 'active';
export const STUCK = 'stuck';
export const DONE = 'done';
export const FUTURE = 'future';
export const columnArray = [ACTIVE, STUCK, DONE, FUTURE];

/* Task Type */
export const ACTION = 'action';
export const PROJECT = 'project';

/* Sorting */
export const SORT_STEP = 1;

/* Areas */
export const MEETING = 'meeting';
export const TEAM_DASH = 'teamDash';
export const USER_DASH = 'userDash';
