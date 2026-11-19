import type {OAuthScopeEnum} from '../../__generated__/OAuthConsentPermissions_request.graphql'
import {
  Business,
  Comment,
  Description,
  Forum,
  Group,
  Insights,
  Person,
  Style,
  TaskAlt
} from '../../ui/icons'
import type {IconComponent} from '../../ui/icons/IconComponent'

type ResourceOf<Scope> = Scope extends `${infer Resource}_READ`
  ? Resource
  : Scope extends `${infer Resource}_WRITE`
    ? Resource
    : never

interface ScopeResourceCopy {
  title: string
  Icon: IconComponent
  read: string
  write: string
  readWrite: string
}

const describeResource = (noun: string) => ({
  read: `Read ${noun}`,
  write: `Create and update ${noun}`,
  readWrite: `Read, create and update ${noun}`
})

const scopeResources = {
  PAGES: {title: 'Pages', Icon: Description, ...describeResource('pages')},
  TASKS: {title: 'Tasks', Icon: TaskAlt, ...describeResource('tasks')},
  MEETINGS: {title: 'Meetings', Icon: Forum, ...describeResource('meetings')},
  COMMENTS: {title: 'Comments', Icon: Comment, ...describeResource('comments')},
  TEMPLATES: {title: 'Templates', Icon: Style, ...describeResource('meeting templates')},
  TEAMS: {title: 'Teams', Icon: Group, ...describeResource('teams')},
  REPORTS: {
    title: 'Reports',
    Icon: Insights,
    read: 'Read reports',
    write: 'Ask questions on the Reports page',
    readWrite: 'Read reports and ask questions on the Reports page'
  },
  ORGS: {
    title: 'Organizations',
    Icon: Business,
    read: 'Read organization details',
    write: 'Update organization details',
    readWrite: 'Read and update organization details'
  },
  USERS: {
    title: 'Profile',
    Icon: Person,
    read: 'Read your profile',
    write: 'Update your profile',
    readWrite: 'Read and update your profile'
  }
} satisfies Record<ResourceOf<OAuthScopeEnum>, ScopeResourceCopy>

export default scopeResources
