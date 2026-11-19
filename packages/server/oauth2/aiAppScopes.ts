import type {Oauthscopeenum} from '../postgres/types/pg'

const aiAppScopes: Oauthscopeenum[] = [
  'meetings:read',
  'meetings:write',
  'tasks:read',
  'tasks:write',
  'pages:read',
  'pages:write',
  'comments:read',
  'comments:write',
  'templates:read',
  'templates:write',
  'teams:read',
  'reports:read',
  'users:read',
  'orgs:read'
]

export default aiAppScopes
