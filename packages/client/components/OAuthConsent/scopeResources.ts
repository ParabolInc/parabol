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

const CREATE_UPDATE = {
  read: 'Read',
  write: 'Create and update',
  readWrite: 'Read, create and update'
}
const UPDATE = {read: 'Read', write: 'Update', readWrite: 'Read and update'}

const scopeResources = {
  PAGES: {title: 'Pages', Icon: Description, ...CREATE_UPDATE},
  TASKS: {title: 'Tasks', Icon: TaskAlt, ...CREATE_UPDATE},
  MEETINGS: {title: 'Meetings', Icon: Forum, ...CREATE_UPDATE},
  COMMENTS: {title: 'Comments', Icon: Comment, ...CREATE_UPDATE},
  TEMPLATES: {title: 'Templates', Icon: Style, ...CREATE_UPDATE},
  TEAMS: {title: 'Teams', Icon: Group, ...CREATE_UPDATE},
  REPORTS: {
    title: 'Reports',
    Icon: Insights,
    read: 'Read',
    write: 'Ask questions',
    readWrite: 'Read and ask questions'
  },
  ORGS: {title: 'Organizations', Icon: Business, ...UPDATE},
  USERS: {title: 'Profile', Icon: Person, ...UPDATE}
} satisfies Record<ResourceOf<OAuthScopeEnum>, ScopeResourceCopy>

export default scopeResources
