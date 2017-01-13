/**
 * Big stuff:
 */
export const APP_NAME = 'Action';
export const APP_REDUX_KEY = `${APP_NAME}:redux`;
// eslint-disable-next-line global-require
export const APP_VERSION = require('../../../package.json').version;
export const APP_VERSION_KEY = `${APP_NAME}:version`;
export const APP_WEBPACK_PUBLIC_PATH_DEFAULT = '/static/';
export const APP_CDN_USER_ASSET_SUBDIR = '/store';
export const APP_MAX_AVATAR_FILE_SIZE = 1024 * 1024;

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
/*
 *  Rather than make a new GraphQL schema for EVERY notification type and union them under Notification and write
 *  some crazy long schema with inline fragments, we just store all required variables in a list with the schema here.
 *  This is fine since notifications are side effects generated server-side, so there is no validating client data
 */

// Sent to billing leaders when their trial will expire in < 2 weeks
export const TRIAL_EXPIRES_SOON = 'TRIAL_EXPIRES_SOON';
// Sent to billing leaders when their trial has expired
export const TRIAL_EXPIRED = 'TRIAL_EXPIRED';
// Sent to billing leaders when a reoccuring payment gets rejected
export const PAYMENT_REJECTED = 'PAYMENT_REJECTED';
// Sent to billing leaders when an orgMember attempts to add a non-orgMember to a team
export const REQUEST_NEW_USER = 'REQUEST_NEW_USER';
// Sent to the orgMember that generated the new user request
export const DENY_NEW_USER = 'DENY_NEW_USER';
// Sent to users who have a credit card expiring within 60 days
export const CC_EXPIRING_SOON = 'CC_EXPIRING_SOON';
export const notificationTypes = [
  TRIAL_EXPIRES_SOON,
  TRIAL_EXPIRED,
  PAYMENT_REJECTED,
  REQUEST_NEW_USER,
  DENY_NEW_USER,
  CC_EXPIRING_SOON
];

/* User Settings */
export const SETTINGS = 'settings';
export const ORGANIZATIONS = 'organizations';
export const NOTIFICATIONS = 'notifications';
export const settingsOrder = [SETTINGS, ORGANIZATIONS, NOTIFICATIONS];


