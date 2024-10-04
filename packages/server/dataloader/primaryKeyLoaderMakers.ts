import getKysely from '../postgres/getKysely'
import {getDiscussionsByIds} from '../postgres/queries/getDiscussionsByIds'
import {getDomainJoinRequestsByIds} from '../postgres/queries/getDomainJoinRequestsByIds'
import getMeetingSeriesByIds from '../postgres/queries/getMeetingSeriesByIds'
import getMeetingTemplatesByIds from '../postgres/queries/getMeetingTemplatesByIds'
import getTemplateRefsByIds from '../postgres/queries/getTemplateRefsByIds'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import {
  selectAgendaItems,
  selectComments,
  selectMeetingSettings,
  selectOrganizations,
  selectReflectPrompts,
  selectRetroReflections,
  selectSlackAuths,
  selectSlackNotifications,
  selectSuggestedAction,
  selectTeamPromptResponses,
  selectTeams,
  selectTemplateDimension,
  selectTemplateScale,
  selectTemplateScaleRef,
  selectTimelineEvent
} from '../postgres/select'
import {primaryKeyLoaderMaker} from './primaryKeyLoaderMaker'

export const users = primaryKeyLoaderMaker(getUsersByIds)

export const teams = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTeams().where('id', 'in', ids).execute()
})
export const discussions = primaryKeyLoaderMaker(getDiscussionsByIds)
export const templateRefs = primaryKeyLoaderMaker(getTemplateRefsByIds)
export const templateScaleRefs = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTemplateScaleRef().where('id', 'in', ids).execute()
})
export const teamPromptResponses = primaryKeyLoaderMaker(async (ids: readonly number[]) => {
  return selectTeamPromptResponses().where('id', 'in', ids).execute()
})
export const meetingSeries = primaryKeyLoaderMaker(getMeetingSeriesByIds)
export const meetingTemplates = primaryKeyLoaderMaker(getMeetingTemplatesByIds)
export const domainJoinRequests = primaryKeyLoaderMaker(getDomainJoinRequestsByIds)

export const embeddingsMetadata = primaryKeyLoaderMaker((ids: readonly number[]) => {
  return getKysely().selectFrom('EmbeddingsMetadata').selectAll().where('id', 'in', ids).execute()
})

export const retroReflectionGroups = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely().selectFrom('RetroReflectionGroup').selectAll().where('id', 'in', ids).execute()
})

export const retroReflections = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectRetroReflections().where('id', 'in', ids).execute()
})

export const timelineEvents = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTimelineEvent().where('id', 'in', ids).execute()
})

export const organizations = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectOrganizations().where('id', 'in', ids).execute()
})

export const saml = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely()
    .selectFrom('SAMLDomain')
    .innerJoin('SAML', 'SAML.id', 'SAMLDomain.samlId')
    .where('SAML.id', 'in', ids)
    .groupBy('SAML.id')
    .selectAll('SAML')
    .select(({fn}) => [fn.agg<string[]>('array_agg', ['SAMLDomain.domain']).as('domains')])
    .execute()
})

export const organizationUsers = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely().selectFrom('OrganizationUser').selectAll().where('id', 'in', ids).execute()
})

export const teamMembers = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely().selectFrom('TeamMember').selectAll().where('id', 'in', ids).execute()
})

export const templateScales = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTemplateScale().where('TemplateScale.id', 'in', ids).execute()
})

export const templateDimensions = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTemplateDimension().where('id', 'in', ids).execute()
})

export const suggestedActions = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectSuggestedAction().where('id', 'in', ids).execute()
})

export const meetingSettings = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectMeetingSettings().where('id', 'in', ids).execute()
})

export const agendaItems = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectAgendaItems().where('id', 'in', ids).execute()
})

export const slackAuths = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectSlackAuths().where('id', 'in', ids).execute()
})

export const slackNotifications = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectSlackNotifications().where('id', 'in', ids).execute()
})

export const featureFlags = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return getKysely().selectFrom('FeatureFlag').selectAll().where('id', 'in', ids).execute()
})

export const comments = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectComments().where('id', 'in', ids).execute()
})

export const reflectPrompts = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectReflectPrompts().where('id', 'in', ids).execute()
})
