import ms from 'ms';
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
export const APP_VERSION_KEY = `${APP_NAME}:version`; // in localStorage
export const APP_WEBPACK_PUBLIC_PATH_DEFAULT = '/static/';

/* Meeting Misc. */
export const MEETING_NAME = 'Action Meeting';
export const MEETING_SUMMARY_LABEL = 'Summary';
export const AGENDA_ITEM_LABEL = 'Agenda Item';

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

/* Columns */
export const ACTIVE = 'active';
export const STUCK = 'stuck';
export const DONE = 'done';
export const FUTURE = 'future';
export const columnArray = [FUTURE, STUCK, ACTIVE, DONE];
export const meetingColumnArray = [DONE, ACTIVE, STUCK, FUTURE];

/* Drag-n-Drop Items */
export const PROJECT = 'project';
export const AGENDA_ITEM = 'agendaItem';

/* Sorting */
export const SORT_STEP = 1;
export const DND_THROTTLE = 25;

/* Areas */
export const MEETING = 'meeting';
export const TEAM_DASH = 'teamDash';
export const USER_DASH = 'userDash';

/* Accounts */
export const PERSONAL_LABEL = 'Personal';
export const PRO_LABEL = 'Pro';

/* NotificationRow Types */
// Send to folks that got reactivated on a team
// annoucements to the rest of the team

export const ADD_TO_TEAM = 'ADD_TO_TEAM';
// Sent to the orgMember that generated the new user request
export const DENY_NEW_USER = 'DENY_NEW_USER';
// Sent to the meeting facilitator by someone who wants to lead
export const FACILITATOR_REQUEST = 'FACILITATOR_REQUEST';
// Sent when a billing leader approves an invitee to the org
export const INVITEE_APPROVED = 'INVITEE_APPROVED';
// sent to the rest of the team when someone has just joined
export const JOIN_TEAM = 'JOIN_TEAM';
// sent to someone just kicked out of a team
export const KICKED_OUT = 'KICKED_OUT';
// Sent to Billing Leaders when a reoccuring payment gets rejected
export const PAYMENT_REJECTED = 'PAYMENT_REJECTED';
// sent to the orgMember that just got promoted, goes away if they get demoted before acknowledging it
export const PROMOTE_TO_BILLING_LEADER = 'PROMOTE_TO_BILLING_LEADER';
// sent to the rest of the team when someone just rejoined
export const REJOIN_TEAM = 'REJOIN_TEAM';
// Sent to Billing Leaders when an orgMember attempts to add a non-orgMember to a team
export const REQUEST_NEW_USER = 'REQUEST_NEW_USER';
// Sent along with an email to someone invited to join the team
export const TEAM_INVITE = 'TEAM_INVITE';
// sent to members of team that was archived
export const TEAM_ARCHIVED = 'TEAM_ARCHIVED';


export const notificationTypes = [
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  DENY_NEW_USER,
  TEAM_ARCHIVED
];

export const billingLeaderTypes = [
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

/* character limits */
export const PROJECT_MAX_CHARS = 51200;

/* Action Tags */
export const tags = [
  {
    name: 'private',
    description: 'Only you will be able to see this project'
  },
  {
    name: 'archived',
    description: 'Hidden from your main board'
  }
];

export const textTags = ['#private', '#archived'];

export const NEWLINE_REGEX = /\r\n?|\n/g;

/* Integrations */
export const DEFAULT_TTL = ms('5m');
export const GITHUB = 'GitHubIntegration';
export const SLACK = 'SlackIntegration';
export const CURRENT_PROVIDERS = [GITHUB, SLACK];
export const GITHUB_SCOPE = 'admin:org_hook,read:org,repo,user:email,write:repo_hook';
export const SLACK_SCOPE = 'identify,incoming-webhook,channels:read,chat:write:bot';
export const GITHUB_ENDPOINT = 'https://api.github.com/graphql';

/* JavaScript specifics */
export const MAX_INT = 2147483647;


// InvitationResultTypes
// the invitation has been sent
export const SUCCESS = 'SUCCESS';
// the approval request has been sent to the billing leader
export const PENDING_APPROVAL = 'PENDING_APPROVAL';
// that email has already been invited
export const ALREADY_ON_TEAM = 'ALREADY_ON_TEAM';
// that email used to be on the team, and now they are again
export const REACTIVATED = 'REACTIVATED';

/* Relay Subscription Channels */
export const NEW_AUTH_TOKEN = 'newAuthToken';
export const NOTIFICATIONS_ADDED = 'notificationsAdded';
export const NOTIFICATIONS_CLEARED = 'notificationsCleared';
export const TEAM_MEMBERS_INVITED = 'teamMembersInvited';
export const ORGANIZATION_ADDED = 'organizationAdded';
export const ORGANIZATION_UPDATED = 'organizationUpdated';
export const PROJECT_UPDATED = 'projectUpdated';

/* Relay Subscription Event Types */
export const ADD = 'add';
export const UPDATE = 'update';
export const DELETE = 'delete';
export const REPLACE = 'replace';

/* Parabol Payment level */
export const PERSONAL = 'personal';
export const PRO = 'pro';
export const ENTERPRISE = 'enterprise';

