export interface ScopeInfo {
  scope: string
  label: string
  description: string
  group: string
}

export interface ScopeGroup {
  key: string
  label: string
}

export const SCOPE_GROUPS: ScopeGroup[] = [
  {key: 'quick-select', label: 'Quick Select'},
  {key: 'meetings', label: 'Meetings'},
  {key: 'teams', label: 'Teams'},
  {key: 'tasks', label: 'Tasks'},
  {key: 'users', label: 'Users'},
  {key: 'org', label: 'Organization'},
  {key: 'templates', label: 'Templates'},
  {key: 'pages', label: 'Pages'},
  {key: 'comments', label: 'Comments'}
]

export const SCOPE_METADATA: ScopeInfo[] = [
  // Quick select (convenience scopes)
  {
    scope: 'read',
    label: 'All read access',
    description: 'Grants read access to all resources',
    group: 'quick-select'
  },
  {
    scope: 'write',
    label: 'All read + write access',
    description: 'Grants read and write access to all resources',
    group: 'quick-select'
  },
  // Meetings
  {
    scope: 'meetings_read',
    label: 'meetings:read',
    description: 'Query meeting data, phases, reflections',
    group: 'meetings'
  },
  {
    scope: 'meetings_write',
    label: 'meetings:write',
    description: 'Start/end meetings, vote, create reflections',
    group: 'meetings'
  },
  // Teams
  {
    scope: 'teams_read',
    label: 'teams:read',
    description: 'Query team info, members, settings',
    group: 'teams'
  },
  {
    scope: 'teams_write',
    label: 'teams:write',
    description: 'Update team settings, manage members',
    group: 'teams'
  },
  // Tasks
  {
    scope: 'tasks_read',
    label: 'tasks:read',
    description: 'Query tasks, task integrations',
    group: 'tasks'
  },
  {
    scope: 'tasks_write',
    label: 'tasks:write',
    description: 'Create, update, delete tasks',
    group: 'tasks'
  },
  // Users
  {
    scope: 'users_read',
    label: 'users:read',
    description: 'Read own user profile, preferences',
    group: 'users'
  },
  {
    scope: 'users_write',
    label: 'users:write',
    description: 'Update own profile, settings',
    group: 'users'
  },
  // Organization
  {
    scope: 'org_read',
    label: 'org:read',
    description: 'Read org info, members, billing status',
    group: 'org'
  },
  {
    scope: 'org_write',
    label: 'org:write',
    description: 'Update org settings, domains',
    group: 'org'
  },
  {
    scope: 'org_admin',
    label: 'org:admin',
    description: 'Manage billing, SAML, SCIM, OAuth providers',
    group: 'org'
  },
  // Templates
  {
    scope: 'templates_read',
    label: 'templates:read',
    description: 'Read meeting templates',
    group: 'templates'
  },
  {
    scope: 'templates_write',
    label: 'templates:write',
    description: 'Create and modify templates',
    group: 'templates'
  },
  // Pages
  {
    scope: 'pages_read',
    label: 'pages:read',
    description: 'Read pages (collaborative docs)',
    group: 'pages'
  },
  {
    scope: 'pages_write',
    label: 'pages:write',
    description: 'Create and edit pages',
    group: 'pages'
  },
  {
    scope: 'pages_admin',
    label: 'pages:admin',
    description: 'Archive pages, manage access, reparent',
    group: 'pages'
  },
  // Comments
  {
    scope: 'comments_read',
    label: 'comments:read',
    description: 'Read discussion threads, comments',
    group: 'comments'
  },
  {
    scope: 'comments_write',
    label: 'comments:write',
    description: 'Post and edit comments',
    group: 'comments'
  }
]

// Hierarchy: selecting a scope auto-selects its dependencies
export const SCOPE_IMPLIES: Record<string, string[]> = {
  write: [
    'read',
    'meetings_write',
    'meetings_read',
    'teams_write',
    'teams_read',
    'tasks_write',
    'tasks_read',
    'users_write',
    'users_read',
    'templates_write',
    'templates_read',
    'pages_write',
    'pages_read',
    'comments_write',
    'comments_read'
  ],
  read: [
    'meetings_read',
    'teams_read',
    'tasks_read',
    'users_read',
    'org_read',
    'templates_read',
    'pages_read',
    'comments_read'
  ],
  org_admin: ['org_write', 'org_read'],
  org_write: ['org_read'],
  pages_admin: ['pages_write', 'pages_read'],
  pages_write: ['pages_read'],
  meetings_write: ['meetings_read'],
  teams_write: ['teams_read'],
  tasks_write: ['tasks_read'],
  users_write: ['users_read'],
  templates_write: ['templates_read'],
  comments_write: ['comments_read']
}

// Reverse: selecting a scope's dependency means deselecting the scope
// e.g., deselecting meetings_read should also deselect meetings_write
export const SCOPE_REQUIRED_BY: Record<string, string[]> = {}
for (const [scope, deps] of Object.entries(SCOPE_IMPLIES)) {
  for (const dep of deps) {
    if (!SCOPE_REQUIRED_BY[dep]) {
      SCOPE_REQUIRED_BY[dep] = []
    }
    SCOPE_REQUIRED_BY[dep]!.push(scope)
  }
}

/** All individual read scopes (not convenience) */
const ALL_READ_SCOPES = SCOPE_METADATA.filter(
  (s) => s.scope.endsWith('_read') && s.group !== 'quick-select'
).map((s) => s.scope)

/** All individual write scopes (not convenience) */
const ALL_WRITE_SCOPES = SCOPE_METADATA.filter(
  (s) => s.scope.endsWith('_write') && s.group !== 'quick-select'
).map((s) => s.scope)

/** Check if "All read access" convenience scope should be checked */
export const isAllReadSelected = (scopes: string[]): boolean => {
  return ALL_READ_SCOPES.every((s) => scopes.includes(s))
}

/** Check if "All read + write access" convenience scope should be checked */
export const isAllWriteSelected = (scopes: string[]): boolean => {
  return (
    ALL_READ_SCOPES.every((s) => scopes.includes(s)) &&
    ALL_WRITE_SCOPES.every((s) => scopes.includes(s))
  )
}
