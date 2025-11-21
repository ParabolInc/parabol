import {Selectable, SelectQueryBuilder} from 'kysely'
import {
  selectAgendaItems,
  type selectAtlassianAuth,
  selectComments,
  type selectDiscussion,
  type selectGitHubAuth,
  type selectGitHubDimensionFieldMap,
  type selectGitLabDimensionFieldMap,
  type selectJiraDimensionFieldMap,
  type selectJiraServerDimensionFieldMap,
  type selectMassInvitations,
  type selectMeetingSeries,
  selectMeetingSettings,
  selectNewFeatures,
  selectNewMeetings,
  selectOrganizations,
  type selectPages,
  type selectPoll,
  type selectPollOption,
  selectReflectPrompts,
  selectRetroReflections,
  selectSlackAuths,
  selectSlackNotifications,
  selectSuggestedAction,
  selectTasks,
  selectTeamInvitations,
  selectTeamMemberIntegrationAuth,
  selectTeamPromptResponses,
  selectTeams,
  type selectTemplateDimension,
  selectTemplateScale,
  selectTemplateScaleRef,
  type selectUser
} from '../select'
import {
  AIPrompt as AIPromptPG,
  FeatureFlag as FeatureFlagPG,
  Insight as InsightPG,
  OrganizationUser as OrganizationUserPG,
  PageAccessRequest as PageAccessRequestPG,
  PageExternalAccess as PageExternalAccessPG,
  PageOrganizationAccess as PageOrganizationAccessPG,
  PageTeamAccess as PageTeamAccessPG,
  PageUserAccess as PageUserAccessPG,
  TaskEstimate as TaskEstimatePG,
  TeamMember as TeamMemberPG
} from './pg'

export type {TaskTag} from 'parabol-client/shared/types'

type ExtractTypeFromQueryBuilderSelect<T extends (...args: any[]) => any> =
  ReturnType<T> extends SelectQueryBuilder<_, _, infer X> ? X : never

export type ReactjiDB = {id: string; userId: string}

export type JiraDimensionField = {
  dimensionName: string
  cloudId: string
  projectKey: string
  issueKey: string
  fieldName: string
  fieldType: string
  fieldId: string
}

export type UsedReactjis = Record<string, number>
export type TranscriptBlock = {
  speaker: string
  words: string
}

export type AutogroupReflectionGroupType = {
  groupTitle: string
  reflectionIds: string[]
}

export interface Organization
  extends ExtractTypeFromQueryBuilderSelect<typeof selectOrganizations> {}
export type OrganizationUser = Selectable<OrganizationUserPG>

export type Reactable = RetroReflection | TeamPromptResponse | Comment
export interface RetroReflection
  extends ExtractTypeFromQueryBuilderSelect<typeof selectRetroReflections> {}

export type SuggestedAction = ExtractTypeFromQueryBuilderSelect<typeof selectSuggestedAction>

export interface Team extends ExtractTypeFromQueryBuilderSelect<typeof selectTeams> {}

export type TeamMember = Selectable<TeamMemberPG>
export interface TeamMemberIntegrationAuth
  extends ExtractTypeFromQueryBuilderSelect<typeof selectTeamMemberIntegrationAuth> {}
export type TeamPromptResponse = ExtractTypeFromQueryBuilderSelect<typeof selectTeamPromptResponses>
export type TemplateScale = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateScale>

// TODO refactor getTemplateScaleRefsByIds to kysely
export type TemplateScaleRef = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateScaleRef>

export type MeetingSettings = ExtractTypeFromQueryBuilderSelect<typeof selectMeetingSettings>
export type PokerMeetingSettings = MeetingSettings & {meetingType: 'poker'}
export type RetrospectiveMeetingSettings = MeetingSettings & {
  meetingType: 'retrospective'
}
export type FeatureFlag = Selectable<FeatureFlagPG>

export type AgendaItem = ExtractTypeFromQueryBuilderSelect<typeof selectAgendaItems>

export type SlackAuth = ExtractTypeFromQueryBuilderSelect<typeof selectSlackAuths>
export type TemplateDimension = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateDimension>

export type SlackNotification = ExtractTypeFromQueryBuilderSelect<typeof selectSlackNotifications>

export type Comment = ExtractTypeFromQueryBuilderSelect<typeof selectComments>
export type ReflectPrompt = ExtractTypeFromQueryBuilderSelect<typeof selectReflectPrompts>
export type Insight = Selectable<InsightPG>

export type NewMeeting = ExtractTypeFromQueryBuilderSelect<typeof selectNewMeetings>
export type NewFeature = ExtractTypeFromQueryBuilderSelect<typeof selectNewFeatures>
export type TeamInvitation = ExtractTypeFromQueryBuilderSelect<typeof selectTeamInvitations>
export type Task = ExtractTypeFromQueryBuilderSelect<typeof selectTasks>
export type TaskEstimate = Selectable<TaskEstimatePG>

export type Discussion = ExtractTypeFromQueryBuilderSelect<typeof selectDiscussion>
// userSortOrder comes from PageUserSortOrder table, and is sometimes prefetched for performance
export type Page = ExtractTypeFromQueryBuilderSelect<typeof selectPages> & {
  userSortOrder?: string | null
}
export type PagePartial = Pick<Page, 'id' | 'title' | 'teamId'> & {
  __typename: 'Page' | 'PagePreview'
}
export type PagePreview = PagePartial & {
  __typename: 'PagePreview'
}
export type MassInvitation = ExtractTypeFromQueryBuilderSelect<typeof selectMassInvitations>
export type PageAccessRequest = Selectable<PageAccessRequestPG>
export type PageExternalAccess = Selectable<PageExternalAccessPG>
export type PageAccessUser = Omit<Selectable<PageUserAccessPG>, 'pageId'>
export type PageAccessTeam = Omit<Selectable<PageTeamAccessPG>, 'pageId'>
export type PageAccessOrganization = Omit<Selectable<PageOrganizationAccessPG>, 'pageId'>

export type AIPrompt = Selectable<AIPromptPG>

export type JiraSearchQuery = {
  id: string
  queryString: string
  isJQL: boolean
  projectKeyFilters?: string[]
  lastUsedAt: string
}

export type AtlassianAuth = ExtractTypeFromQueryBuilderSelect<typeof selectAtlassianAuth>

export interface GitHubSearchQuery {
  id: string
  queryString: string
  lastUsedAt: string
}
export type GitHubAuth = ExtractTypeFromQueryBuilderSelect<typeof selectGitHubAuth>
export type GitLabDimensionFieldMap = ExtractTypeFromQueryBuilderSelect<
  typeof selectGitLabDimensionFieldMap
>
export type GitHubDimensionFieldMap = ExtractTypeFromQueryBuilderSelect<
  typeof selectGitHubDimensionFieldMap
>

export type JiraDimensionFieldMap = ExtractTypeFromQueryBuilderSelect<
  typeof selectJiraDimensionFieldMap
>

export type JiraServerDimensionFieldMap = ExtractTypeFromQueryBuilderSelect<
  typeof selectJiraServerDimensionFieldMap
>

export type TAuthIdentity = 'GOOGLE' | 'LOCAL' | 'MICROSOFT'

export type UserAuthIdentity = {
  id: string
  isEmailVerified?: boolean
  type: TAuthIdentity
}
export type User = ExtractTypeFromQueryBuilderSelect<typeof selectUser>

export type Poll = ExtractTypeFromQueryBuilderSelect<typeof selectPoll>

export type PollOption = ExtractTypeFromQueryBuilderSelect<typeof selectPollOption>
export type MeetingSeries = ExtractTypeFromQueryBuilderSelect<typeof selectMeetingSeries>
