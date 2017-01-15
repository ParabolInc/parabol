import ms from 'ms';
export const JWT_LIFESPAN = ms('30d');
export const INVITATION_LIFESPAN = ms('30d');
export const REFRESH_JWT_AFTER = ms('15d');
export const TRIAL_PERIOD_DAYS = 30;
export const TRIAL_PERIOD = ms(`${TRIAL_PERIOD_DAYS}d`);
export const TRIAL_EXTENSION = ms('30d');
export const INACTIVE_DAYS_THRESH = ms('7d');

/* stripe variables */
export const ACTION_MONTHLY = 'action-monthly';
export const ADD_USER = 'addUser';
export const PAUSE_USER = 'pauseUser';
export const REMOVE_USER = 'removeUser';
export const UNPAUSE_USER = 'unpauseUser';
export const MAX_MONTHLY_PAUSES = 4;

