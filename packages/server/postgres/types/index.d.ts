import {SelectQueryBuilder, Selectable} from 'kysely'
import {
  Discussion as DiscussionPG,
  OrganizationUser as OrganizationUserPG,
  TeamMember as TeamMemberPG
} from '../pg.d'
import {selectSuggestedAction, selectTemplateScale, selectTemplateScaleRef} from '../select'

type ExtractTypeFromQueryBuilderSelect<T extends (...args: any[]) => any> =
  ReturnType<T> extends SelectQueryBuilder<infer _A, infer _B, infer X> ? X : never

export type Discussion = Selectable<DiscussionPG>
export type OrganizationUser = Selectable<OrganizationUserPG>

export type SuggestedAction = ExtractTypeFromQueryBuilderSelect<typeof selectSuggestedAction>

export type TeamMember = Selectable<TeamMemberPG>

export type TemplateScale = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateScale>

// TODO refactor getTemplateScaleRefsByIds to kysely
export type TemplateScaleRef = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateScaleRef>
