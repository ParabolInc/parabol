/**
 * Big stuff:
 */
export const APP_CDN_USER_ASSET_SUBDIR = '/store';
export const APP_MAX_AVATAR_FILE_SIZE = 1024 * 1024;
export const APP_NAME = 'Action';
export const APP_REDUX_KEY = `${APP_NAME}:redux`;
/**
 * Upgrade pending states, called when the server version changes.
 * Must be a string:
 *
 *    APP_UPGRADE_PENDING_FALSE: no upgrade needed
 *   APP_UPGRADE_PENDING_RELOAD: client reload needed
 *     APP_UPGRADE_PENDING_DONE: upgrade complete
 *
 * Stored in localSession by APP_UPGRADE_PENDING_KEY.
 */
export const APP_UPGRADE_PENDING_KEY = `${APP_NAME}:upgradePending`;
export const APP_UPGRADE_PENDING_FALSE = 'false';
export const APP_UPGRADE_PENDING_RELOAD = 'reload';
export const APP_UPGRADE_PENDING_DONE = 'done';
// eslint-disable-next-line global-require
export const APP_VERSION = require('../../../package.json').version;
export const APP_VERSION_KEY = `${APP_NAME}:version`;         // in localStorage
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
