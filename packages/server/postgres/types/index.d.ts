import {SelectQueryBuilder, Selectable} from 'kysely'
import {OrganizationUser as OrganizationUserPG, TeamMember as TeamMemberPG} from '../pg.d'
import {selectTemplateScale} from '../select'

type ExtractTypeFromQueryBuilderSelect<T extends (...args: any[]) => any> =
  ReturnType<T> extends SelectQueryBuilder<infer _A, infer _B, infer X> ? X : never

export type OrganizationUser = Selectable<OrganizationUserPG>

export type TeamMember = Selectable<TeamMemberPG>

export type TemplateScale = ExtractTypeFromQueryBuilderSelect<typeof selectTemplateScale>
