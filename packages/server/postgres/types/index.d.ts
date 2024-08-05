import {SelectQueryBuilder, Selectable} from 'kysely'
import type Comment from '../../database/types/Comment'
import {
  Discussion as DiscussionPG,
  OrganizationUser as OrganizationUserPG,
  TeamMember as TeamMemberPG,
  TeamPromptResponse as TeamPromptResponsePG
} from '../pg.d'
import {
  selectOrganizations,
  selectRetroReflections,
  selectSuggestedAction,
  selectTeams,
  selectTemplateScale,
  selectTemplateScaleRef
} from '../select'

type ExtractTypeFromQueryBuilderSelect<T extends (...args: any[]) => any> =
  ReturnType<T> extends SelectQueryBuilder<_, _, infer X> ? X : never

export type Discussion = Selectable<DiscussionPG>

export interface Organization
  extends ExtractTypeFromQueryBuilderSelect<typeof selectOrganizations> {}
export type OrganizationUser = Selectable<OrganizationUserPG>

export type Reactable = RetroReflection | TeamPromptResponse | Comment
export interface RetroReflection
  extends ExtractTypeFromQueryBuilderSelect<typeof selectRetroReflections> {}

export type SuggestedAction = ExtractTypeFromQueryBuilderSelect<typeof selectSuggestedAction>

export interface Team extends ExtractTypeFromQueryBuilderSelect<typeof selectTeams> {}

export type TeamMember = Selectable<TeamMemberPG>

export type TeamPromptResponse = Selectable<TeamPromptResponsePG>
export type TemplateScale = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateScale>

// TODO refactor getTemplateScaleRefsByIds to kysely
export type TemplateScaleRef = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateScaleRef>
