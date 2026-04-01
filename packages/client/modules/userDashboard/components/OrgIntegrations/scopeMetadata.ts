import type {OAuthScopeEnum} from '~/__generated__/OAuthAppFormEditQuery.graphql'

export interface ScopeInfo {
  scope: OAuthScopeEnum
  label: string
  description: string
  group: string
}

export interface ScopeGroup {
  key: string
  label: string
}

export const SCOPE_GROUPS: ScopeGroup[] = [
  {key: 'meetings', label: 'Meetings'},
  {key: 'teams', label: 'Teams'},
  {key: 'tasks', label: 'Tasks'},
  {key: 'users', label: 'Users'},
  {key: 'org', label: 'Organization'},
  {key: 'templates', label: 'Templates'},
  {key: 'pages', label: 'Pages'},
  {key: 'comments', label: 'Comments'}
]

export const SCOPE_METADATA = [
  // Meetings
  {
    scope: 'MEETINGS_READ',
    label: 'meetings:read',
    description: 'Query meeting data, phases, reflections',
    group: 'meetings'
  },
  {
    scope: 'MEETINGS_WRITE',
    label: 'meetings:write',
    description: 'Start/end meetings, vote, create reflections',
    group: 'meetings'
  },
  // Teams
  {
    scope: 'TEAMS_READ',
    label: 'teams:read',
    description: 'Query team info, members, settings',
    group: 'teams'
  },
  {
    scope: 'TEAMS_WRITE',
    label: 'teams:write',
    description: 'Update team settings, manage members',
    group: 'teams'
  },
  // Tasks
  {
    scope: 'TASKS_READ',
    label: 'tasks:read',
    description: 'Query tasks, task integrations',
    group: 'tasks'
  },
  {
    scope: 'TASKS_WRITE',
    label: 'tasks:write',
    description: 'Create, update, delete tasks',
    group: 'tasks'
  },
  // Users
  {
    scope: 'USERS_READ',
    label: 'users:read',
    description: 'Read own user profile, preferences',
    group: 'users'
  },
  {
    scope: 'USERS_WRITE',
    label: 'users:write',
    description: 'Update own profile, settings',
    group: 'users'
  },
  // Organization
  {
    scope: 'ORG_READ',
    label: 'org:read',
    description: 'Read org info, members, billing status',
    group: 'org'
  },
  {
    scope: 'ORG_WRITE',
    label: 'org:write',
    description: 'Update org settings, domains',
    group: 'org'
  },
  // Templates
  {
    scope: 'TEMPLATES_READ',
    label: 'templates:read',
    description: 'Read meeting templates',
    group: 'templates'
  },
  {
    scope: 'TEMPLATES_WRITE',
    label: 'templates:write',
    description: 'Create and modify templates',
    group: 'templates'
  },
  // Pages
  {
    scope: 'PAGES_READ',
    label: 'pages:read',
    description: 'Read pages (collaborative docs)',
    group: 'pages'
  },
  {
    scope: 'PAGES_WRITE',
    label: 'pages:write',
    description: 'Create and edit pages',
    group: 'pages'
  },
  // Comments
  {
    scope: 'COMMENTS_READ',
    label: 'comments:read',
    description: 'Read discussion threads, comments',
    group: 'comments'
  },
  {
    scope: 'COMMENTS_WRITE',
    label: 'comments:write',
    description: 'Post and edit comments',
    group: 'comments'
  }
] as const satisfies readonly ScopeInfo[]

// Hierarchy: selecting a scope auto-selects its dependencies
export const SCOPE_IMPLIES: Partial<Record<OAuthScopeEnum, OAuthScopeEnum[]>> = {
  ORG_WRITE: ['ORG_READ'],
  PAGES_WRITE: ['PAGES_READ'],
  MEETINGS_WRITE: ['MEETINGS_READ'],
  TEAMS_WRITE: ['TEAMS_READ'],
  TASKS_WRITE: ['TASKS_READ'],
  USERS_WRITE: ['USERS_READ'],
  TEMPLATES_WRITE: ['TEMPLATES_READ'],
  COMMENTS_WRITE: ['COMMENTS_READ']
}

// Reverse: deselecting a scope's dependency also deselects the scope
export const SCOPE_REQUIRED_BY: Partial<Record<OAuthScopeEnum, OAuthScopeEnum[]>> = {}
for (const [scope, deps] of Object.entries(SCOPE_IMPLIES) as [OAuthScopeEnum, OAuthScopeEnum[]][]) {
  for (const dep of deps) {
    if (!SCOPE_REQUIRED_BY[dep]) {
      SCOPE_REQUIRED_BY[dep] = []
    }
    SCOPE_REQUIRED_BY[dep]!.push(scope)
  }
}

export const ALL_READ_SCOPES: OAuthScopeEnum[] = SCOPE_METADATA.filter((s) =>
  s.scope.endsWith('_READ')
).map((s) => s.scope)

export const ALL_WRITE_SCOPES: OAuthScopeEnum[] = SCOPE_METADATA.filter((s) =>
  s.scope.endsWith('_WRITE')
).map((s) => s.scope)
