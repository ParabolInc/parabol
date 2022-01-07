import {getUsersByIdsQuery} from '../postgres/queries/generated/getUsersByIdsQuery'
import {
  getDiscussionsByIdsQuery,
  IGetDiscussionsByIdsQueryResult
} from '../postgres/queries/generated/getDiscussionsByIdsQuery'
import IUser from '../postgres/types/IUser'
import {getTeamsByIdsQuery} from '../postgres/queries/generated/getTeamsByIdsQuery'
import {getTemplateRefsByIdsQuery} from '../postgres/queries/generated/getTemplateRefsByIdsQuery'
import {TemplateRef} from '../postgres/queries/getTemplateRefsByIds'
import {getTemplateScaleRefsByIdsQuery} from '../postgres/queries/generated/getTemplateScaleRefsByIdsQuery'
import {TemplateScaleRef} from '../postgres/queries/getTemplateScaleRefsByIds'
import {pgPrimaryLoaderMaker} from './pgPrimaryKeyLoaderMaker'
import {Team} from '../postgres/queries/getTeamsByIds'

export const users = pgPrimaryLoaderMaker<IUser | undefined>(getUsersByIdsQuery)
export const teams = pgPrimaryLoaderMaker<Team>(getTeamsByIdsQuery)
export const discussions = pgPrimaryLoaderMaker<IGetDiscussionsByIdsQueryResult | null>(
  getDiscussionsByIdsQuery
)
export const templateRefs = pgPrimaryLoaderMaker<TemplateRef>(getTemplateRefsByIdsQuery)
export const templateScaleRefs = pgPrimaryLoaderMaker<TemplateScaleRef>(
  getTemplateScaleRefsByIdsQuery
)
