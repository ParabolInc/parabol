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
export const phaseOrder = (phase) => phaseArray.indexOf(phase);

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
export const DND_THROTTLE = 25;

/* Areas */
export const MEETING = 'meeting';
export const TEAM_DASH = 'teamDash';
export const USER_DASH = 'userDash';

/* NotificationRow Types */
// Sent to Billing Leaders when their trial will expire in < 2 weeks
// varList = [trialExpiresAt]
export const TRIAL_EXPIRES_SOON = 'TRIAL_EXPIRES_SOON';
// Sent to Billing Leaders when their trial has expired
// varList = [trialExpiresAt]
export const TRIAL_EXPIRED = 'TRIAL_EXPIRED';
// Sent to Billing Leaders when a reoccuring payment gets rejected
// varList = [last4, brand]
export const PAYMENT_REJECTED = 'PAYMENT_REJECTED';
// Sent to Billing Leaders when an orgMember attempts to add a non-orgMember to a team
// [inviterId, inviterName, inviteeEmail, invitedTeamId, invitedTeamName]
export const REQUEST_NEW_USER = 'REQUEST_NEW_USER';
// Sent to the orgMember that generated the new user request
// [reason, billingLeaderName, inviteeEmail]
export const DENY_NEW_USER = 'DENY_NEW_USER';
// sent to the orgMember that just got promoted, goes away if they get demoted before acknowledging it
// [orgName]
export const PROMOTE_TO_BILLING_LEADER = 'PROMOTE_TO_BILLING_LEADER';


export const notificationTypes = [
  TRIAL_EXPIRES_SOON,
  TRIAL_EXPIRED,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  DENY_NEW_USER
];

export const billingLeaderTypes = [
  TRIAL_EXPIRES_SOON,
  TRIAL_EXPIRED,
  PAYMENT_REJECTED,
  REQUEST_NEW_USER
];

/* User Settings */
export const SETTINGS = 'settings';
export const ORGANIZATIONS = 'organizations';
export const NOTIFICATIONS = 'notifications';
export const settingsOrder = [SETTINGS, ORGANIZATIONS, NOTIFICATIONS];

/* Org Settings */
export const BILLING_PAGE = 'billing';
export const MEMBERS_PAGE = 'members';

/* User Org Roles */
export const BILLING_LEADER = 'billingLeader';

/* Stripe */
// changing this does NOT change it in stripe, it just changes the UI
export const MONTHLY_PRICE = 5;
export const ADDED_USERS = 'ADDED_USERS';
export const REMOVED_USERS = 'REMOVED_USERS';
export const INACTIVITY_ADJUSTMENTS = 'INACTIVITY_ADJUSTMENTS';
export const OTHER_ADJUSTMENTS = 'OTHER_ADJUSTMENTS';

/* Invoice status variables */
export const UPCOMING = 'UPCOMING';
export const PENDING = 'PENDING';
export const PAID = 'PAID';
export const FAILED = 'FAILED';
