/**
 * Big stuff:
 */
export const APP_NAME = 'Action';
export const APP_REDUX_KEY = `${APP_NAME}:redux`;
// eslint-disable-next-line global-require
export const APP_VERSION = require('../../../package.json').version;
export const APP_VERSION_KEY = `${APP_NAME}:version`;
export const APP_WEBPACK_PUBLIC_PATH_DEFAULT = '/static/';

/* Phases */
export const LOBBY = 'lobby';
// lowercase here to match url
export const CHECKIN = 'checkin';
export const UPDATES = 'updates';
export const FIRST_CALL = 'firstcall';
export const AGENDA_ITEMS = 'agendaitems';
export const LAST_CALL = 'lastcall';
export const SUMMARY = 'summary';
export const phaseArray = [LOBBY, CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL, SUMMARY];
export const phaseOrder = phase => phaseArray.indexOf(phase);

/* Columns */
export const ACTIVE = 'active';
export const STUCK = 'stuck';
export const DONE = 'done';
export const FUTURE = 'future';
export const columnArray = [DONE, ACTIVE, STUCK, FUTURE];

/* Drag-n-Drop Items*/
export const ACTION = 'action';
export const PROJECT = 'project';
export const AGENDA_ITEM = 'agendaItem';

/* Sorting */
export const SORT_STEP = 1;
export const MIN_SORT_RESOLUTION = 1e-20;

/* Areas */
export const MEETING = 'meeting';
export const TEAM_DASH = 'teamDash';
export const USER_DASH = 'userDash';

/* Notification Types */
export const TRIAL_EXPIRES_SOON = 'TRIAL_EXPIRES_SOON';
export const TRIAL_EXPIRED = 'TRIAL_EXPIRED';
export const PAYMENT_REJECTED = 'PAYMENT_REJECTED';
export const APPROVE_TO_ORG = 'APPROVE_TO_ORG';
export const ACCEPT_TO_ORG = 'ACCEPT_TO_ORG';
export const DENY_TO_ORG = 'DENY_TO_ORG';
