import ms from 'ms';

export const JWT_LIFESPAN = ms('30d');
export const INVITATION_LIFESPAN = ms('30d');
export const REFRESH_JWT_AFTER = ms('15d');
export const AUTO_PAUSE_THRESH = ms('30d');
export const OLD_MEETING_AGE = ms('1d');
export const MAX_PERSONAL_PROJECTS = 500;

/* stripe variables */
// $199,999/mo
// export const ACTION_MONTHLY = 'dev-monthly';
// $5/mo
export const ACTION_MONTHLY = 'action-monthly';
export const ADD_USER = 'addUser';
export const PAUSE_USER = 'pauseUser';
export const AUTO_PAUSE_USER = 'autoPauseUser';
export const REMOVE_USER = 'removeUser';
export const UNPAUSE_USER = 'unpauseUser';
export const MAX_MONTHLY_PAUSES = 4;
export const UPCOMING_INVOICE_TIME_VALID = ms('2m');

/* invite token keys */
export const INVITE_TOKEN_INVITE_ID_LEN = 6;
export const INVITE_TOKEN_KEY_LEN = 8;

/* invitation actions */
// export const SEND_NOTIFICATION = 'SEND_NOTIFICATION';
// export const SEND_EMAIL = 'SEND_EMAIL';
export const REACTIVATE = 'REACTIVATE';
export const SEND_INVITATION = 'SEND_INVITIATION';
export const ASK_APPROVAL = 'ASK_APPROVAL';

/* Org Approval Status */
export const APPROVED = 'APPROVED';
export const DENIED = 'DENIED';
export const PENDING = 'PENDING';
