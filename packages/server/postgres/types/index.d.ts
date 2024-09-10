import {SelectQueryBuilder, Selectable} from 'kysely'
import {
  Discussion as DiscussionPG,
  OrganizationUser as OrganizationUserPG,
  TeamMember as TeamMemberPG
} from '../pg.d'
import {
  selectAgendaItems,
  selectComments,
  selectMeetingSettings,
  selectOrganizations,
  selectRetroReflections,
  selectSlackAuths,
  selectSlackNotifications,
  selectSuggestedAction,
  selectTeamPromptResponses,
  selectTeams,
  selectTemplateScale,
  selectTemplateScaleRef
} from '../select'

type ExtractTypeFromQueryBuilderSelect<T extends (...args: any[]) => any> =
  ReturnType<T> extends SelectQueryBuilder<_, _, infer X> ? X : never

export type Discussion = Selectable<DiscussionPG>
export type ReactjiDB = {id: string; userId: string}

export interface Organization
  extends ExtractTypeFromQueryBuilderSelect<typeof selectOrganizations> {}
export type OrganizationUser = Selectable<OrganizationUserPG>

export type Reactable = RetroReflection | TeamPromptResponse | Comment
export interface RetroReflection
  extends ExtractTypeFromQueryBuilderSelect<typeof selectRetroReflections> {}

export type SuggestedAction = ExtractTypeFromQueryBuilderSelect<typeof selectSuggestedAction>

export interface Team extends ExtractTypeFromQueryBuilderSelect<typeof selectTeams> {}

export type TeamMember = Selectable<TeamMemberPG>

export type TeamPromptResponse = ExtractTypeFromQueryBuilderSelect<typeof selectTeamPromptResponses>
export type TemplateScale = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateScale>

// TODO refactor getTemplateScaleRefsByIds to kysely
export type TemplateScaleRef = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateScaleRef>

export type MeetingSettings = ExtractTypeFromQueryBuilderSelect<typeof selectMeetingSettings>
export type PokerMeetingSettings = MeetingSettings & {meetingType: 'poker'}
export type RetrospectiveMeetingSettings = MeetingSettings & {meetingType: 'retrospective'}

export type AgendaItem = ExtractTypeFromQueryBuilderSelect<typeof selectAgendaItems>

export type SlackAuth = ExtractTypeFromQueryBuilderSelect<typeof selectSlackAuths>

export type SlackNotification = ExtractTypeFromQueryBuilderSelect<typeof selectSlackNotifications>

export type Comment = ExtractTypeFromQueryBuilderSelect<typeof selectComments>
