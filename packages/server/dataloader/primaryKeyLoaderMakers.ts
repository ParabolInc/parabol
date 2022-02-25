import getTemplateRefsByIds from '../postgres/queries/getTemplateRefsByIds'
import getTemplateScaleRefsByIds from '../postgres/queries/getTemplateScaleRefsByIds'
import {primaryKeyLoaderMaker} from './primaryKeyLoaderMaker'
import getTeamsByIds from '../postgres/queries/getTeamsByIds'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import {getDiscussionsByIds} from '../postgres/queries/getDiscussionsByIds'

export const users = primaryKeyLoaderMaker(getUsersByIds)
export const teams = primaryKeyLoaderMaker(getTeamsByIds)
export const discussions = primaryKeyLoaderMaker(getDiscussionsByIds)
export const templateRefs = primaryKeyLoaderMaker(getTemplateRefsByIds)
export const templateScaleRefs = primaryKeyLoaderMaker(getTemplateScaleRefsByIds)
