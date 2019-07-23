import ms from 'ms'

export const JWT_LIFESPAN = ms('30d')
export const TEAM_INVITATION_LIFESPAN = ms('7d')
export const REFRESH_JWT_AFTER = ms('15d')
export const AUTO_PAUSE_THRESH = ms('30d')
export const OLD_MEETING_AGE = ms('1d')
export const UPCOMING_INVOICE_EMAIL_WARNING = ms('4d')
export const MEETING_FACILITATOR_ELECTION_TIMEOUT = 5000
// must be longer than MEETING_FACILITATOR_ELECTION_TIMEOUT
export const SHARED_DATA_LOADER_TTL = 10000
// export const ACTION_MONTHLY = 'action-monthly' // $5/seat/mo DEPRECATED
export const ADD_USER = 'addUser'
export const PAUSE_USER = 'pauseUser'
export const AUTO_PAUSE_USER = 'autoPauseUser'
export const REMOVE_USER = 'removeUser'
export const UNPAUSE_USER = 'unpauseUser'
export const MAX_MONTHLY_PAUSES = 4
export const UPCOMING_INVOICE_TIME_VALID = ms('2m')
export const MAX_FREE_TEAMS = 10
