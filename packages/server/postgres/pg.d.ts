import type {ColumnType} from 'kysely'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export type Json = ColumnType<JsonValue, string, string>

export type JsonArray = JsonValue[]

export type JsonObject = {
  [K in string]?: JsonValue
}

export type JsonPrimitive = boolean | null | number | string

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface AtlassianAuth {
  accessToken: string
  refreshToken: string
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  isActive: Generated<boolean>
  jiraSearchQueries: Generated<Json[]>
  cloudIds: Generated<string[]>
  scope: string
  accountId: string
  teamId: string
  userId: string
}

export interface AzureDevOpsDimensionFieldMap {
  id: Generated<number>
  teamId: string
  dimensionName: string
  fieldName: string
  fieldId: string
  instanceId: string
  fieldType: string
  projectKey: string
  workItemType: string
}

export interface Discussion {
  id: string
  createdAt: Generated<Timestamp>
  teamId: string
  meetingId: string
  discussionTopicId: string
  discussionTopicType:
    | 'agendaItem'
    | 'githubIssue'
    | 'jiraIssue'
    | 'reflectionGroup'
    | 'task'
    | 'teamPromptResponse'
  summary: string | null
}

export interface GitHubAuth {
  accessToken: string
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  isActive: Generated<boolean>
  login: string
  teamId: string
  userId: string
  githubSearchQueries: Generated<Json[]>
  scope: string
}

export interface GitHubDimensionFieldMap {
  id: Generated<number>
  teamId: string
  dimensionName: string
  nameWithOwner: string
  labelTemplate: string
}

export interface GitLabDimensionFieldMap {
  id: Generated<number>
  teamId: string
  dimensionName: string
  projectId: number
  providerId: number
  labelTemplate: string
}

export interface IntegrationProvider {
  id: Generated<number>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  service: 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost' | 'msTeams'
  authStrategy: 'oauth1' | 'oauth2' | 'pat' | 'webhook'
  scope: 'global' | 'org' | 'team'
  scopeGlobal: Generated<boolean>
  teamId: string
  isActive: Generated<boolean>
  clientId: string | null
  clientSecret: string | null
  serverBaseUrl: string | null
  webhookUrl: string | null
  consumerKey: string | null
  consumerSecret: string | null
  tenantId: string | null
}

export interface IntegrationSearchQuery {
  id: Generated<number>
  userId: string
  teamId: string
  providerId: number | null
  service: 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost' | 'msTeams'
  query: Generated<Json>
  lastUsedAt: Generated<Timestamp>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export interface JiraDimensionFieldMap {
  id: Generated<number>
  teamId: string
  cloudId: string
  projectKey: string
  issueType: string
  dimensionName: string
  fieldId: string
  fieldName: string
  fieldType: string
  updatedAt: Generated<Timestamp>
}

export interface JiraServerDimensionFieldMap {
  id: Generated<number>
  providerId: number
  teamId: string
  dimensionName: string
  projectId: string
  issueType: string
  fieldId: string
  fieldName: string
  fieldType: string
}

export interface MeetingSeries {
  id: Generated<number>
  meetingType: 'action' | 'poker' | 'retrospective' | 'teamPrompt'
  title: string
  recurrenceRule: string
  duration: number
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  cancelledAt: Timestamp | null
  teamId: string
  facilitatorId: string
}

export interface MeetingTemplate {
  id: string
  createdAt: Generated<Timestamp>
  isActive: Generated<boolean>
  name: string
  teamId: string
  updatedAt: Generated<Timestamp>
  scope: Generated<'ORGANIZATION' | 'PUBLIC' | 'TEAM' | 'USER'>
  orgId: string
  parentTemplateId: string | null
  lastUsedAt: Timestamp | null
  type: 'action' | 'poker' | 'retrospective' | 'teamPrompt'
  isStarter: Generated<boolean>
  isFree: Generated<boolean>
}

export interface OrganizationApprovedDomain {
  id: Generated<number>
  createdAt: Generated<Timestamp>
  removedAt: Timestamp | null
  domain: string
  orgId: string
  addedByUserId: string
}

export interface OrganizationUserAudit {
  id: Generated<number>
  orgId: string
  userId: string
  eventDate: Timestamp
  eventType: 'activated' | 'added' | 'inactivated' | 'removed'
}

export interface Poll {
  id: Generated<number>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  deletedAt: Timestamp | null
  endedAt: Timestamp | null
  createdById: string
  discussionId: string
  teamId: string
  threadSortOrder: number
  meetingId: string | null
  title: string | null
}

export interface PollOption {
  id: Generated<number>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  pollId: number
  voteUserIds: Generated<string[]>
  title: string | null
}

export interface TaskEstimate {
  id: Generated<number>
  createdAt: Generated<Timestamp>
  changeSource: 'external' | 'meeting' | 'task'
  name: string
  label: string
  taskId: string
  userId: string
  meetingId: string | null
  stageId: string | null
  discussionId: string | null
  jiraFieldId: string | null
  githubLabelName: string | null
  azureDevOpsFieldName: string | null
}

export interface Team {
  id: string
  name: string
  createdAt: Generated<Timestamp>
  createdBy: string | null
  isArchived: Generated<boolean>
  isPaid: Generated<boolean>
  jiraDimensionFields: Generated<Json[]>
  lastMeetingType: Generated<'action' | 'poker' | 'retrospective' | 'teamPrompt'>
  tier: 'enterprise' | 'starter' | 'team'
  orgId: string
  isOnboardTeam: Generated<boolean>
  updatedAt: Generated<Timestamp>
  lockMessageHTML: string | null
  qualAIMeetingsCount: Generated<number>
}

export interface TeamMemberIntegrationAuth {
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  teamId: string
  userId: string
  providerId: number
  service: 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost' | 'msTeams'
  isActive: Generated<boolean>
  accessToken: string | null
  refreshToken: string | null
  scopes: string | null
  accessTokenSecret: string | null
  expiresAt: Timestamp | null
}

export interface TeamPromptResponse {
  id: Generated<number>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  meetingId: string
  userId: string
  sortOrder: number
  content: Json
  plaintextContent: string
  reactjis: Generated<string[]>
}

export interface TemplateRef {
  id: string
  template: Json
  createdAt: Generated<Timestamp | null>
}

export interface TemplateScaleRef {
  id: string
  scale: Json
  createdAt: Generated<Timestamp | null>
}

export interface User {
  id: string
  email: string
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  inactive: Generated<boolean>
  lastSeenAt: Generated<Timestamp>
  preferredName: string
  tier: Generated<'enterprise' | 'starter' | 'team'>
  picture: string
  tms: Generated<string[]>
  featureFlags: Generated<string[]>
  identities: Generated<Json[]>
  lastSeenAtURLs: string[] | null
  segmentId: string | null
  newFeatureId: string | null
  overLimitCopy: string | null
  isRemoved: Generated<boolean>
  reasonRemoved: string | null
  rol: 'su' | null
  payLaterClickCount: Generated<number>
  isWatched: Generated<boolean>
  domain: Generated<string | null>
  sendSummaryEmail: Generated<boolean>
  isPatient0: Generated<boolean>
}

export interface DB {
  AtlassianAuth: AtlassianAuth
  AzureDevOpsDimensionFieldMap: AzureDevOpsDimensionFieldMap
  Discussion: Discussion
  GitHubAuth: GitHubAuth
  GitHubDimensionFieldMap: GitHubDimensionFieldMap
  GitLabDimensionFieldMap: GitLabDimensionFieldMap
  IntegrationProvider: IntegrationProvider
  IntegrationSearchQuery: IntegrationSearchQuery
  JiraDimensionFieldMap: JiraDimensionFieldMap
  JiraServerDimensionFieldMap: JiraServerDimensionFieldMap
  MeetingSeries: MeetingSeries
  MeetingTemplate: MeetingTemplate
  OrganizationApprovedDomain: OrganizationApprovedDomain
  OrganizationUserAudit: OrganizationUserAudit
  Poll: Poll
  PollOption: PollOption
  TaskEstimate: TaskEstimate
  Team: Team
  TeamMemberIntegrationAuth: TeamMemberIntegrationAuth
  TeamPromptResponse: TeamPromptResponse
  TemplateRef: TemplateRef
  TemplateScaleRef: TemplateScaleRef
  User: User
}
