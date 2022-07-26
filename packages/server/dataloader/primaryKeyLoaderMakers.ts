import {getDiscussionsByIds} from '../postgres/queries/getDiscussionsByIds'
import getMeetingSeriesByIds from '../postgres/queries/getMeetingSeriesByIds'
import {getTeamPromptResponsesByIds} from '../postgres/queries/getTeamPromptResponsesByIds'
import getTeamsByIds from '../postgres/queries/getTeamsByIds'
import getTemplateRefsByIds from '../postgres/queries/getTemplateRefsByIds'
import getTemplateScaleRefsByIds from '../postgres/queries/getTemplateScaleRefsByIds'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import {primaryKeyLoaderMaker} from './primaryKeyLoaderMaker'

export const users = primaryKeyLoaderMaker(getUsersByIds)
export const teams = primaryKeyLoaderMaker(getTeamsByIds)
export const discussions = primaryKeyLoaderMaker(getDiscussionsByIds)
export const templateRefs = primaryKeyLoaderMaker(getTemplateRefsByIds)
export const templateScaleRefs = primaryKeyLoaderMaker(getTemplateScaleRefsByIds)
export const teamPromptResponses = primaryKeyLoaderMaker(getTeamPromptResponsesByIds)
export const meetingSeries = primaryKeyLoaderMaker(getMeetingSeriesByIds)
