import type {Oauthscopeenum} from '../../../postgres/types/pg'

// Maps GraphQL enum member names to their internal DB values (Oauthscopeenum)
const OAuthScopeEnum: Record<string, Oauthscopeenum> = {
  MEETINGS_READ: 'meetings:read',
  MEETINGS_WRITE: 'meetings:write',
  TEAMS_READ: 'teams:read',
  TEAMS_WRITE: 'teams:write',
  TASKS_READ: 'tasks:read',
  TASKS_WRITE: 'tasks:write',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  ORGS_READ: 'orgs:read',
  ORGS_WRITE: 'orgs:write',
  TEMPLATES_READ: 'templates:read',
  TEMPLATES_WRITE: 'templates:write',
  PAGES_READ: 'pages:read',
  PAGES_WRITE: 'pages:write',
  COMMENTS_READ: 'comments:read',
  COMMENTS_WRITE: 'comments:write'
}

export default OAuthScopeEnum
