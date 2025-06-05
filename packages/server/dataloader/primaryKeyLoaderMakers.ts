import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import {getDomainJoinRequestsByIds} from '../postgres/queries/getDomainJoinRequestsByIds'
import getMeetingSeriesByIds from '../postgres/queries/getMeetingSeriesByIds'
import getMeetingTemplatesByIds from '../postgres/queries/getMeetingTemplatesByIds'
import getTemplateRefsByIds from '../postgres/queries/getTemplateRefsByIds'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import {
  selectAgendaItems,
  selectComments,
  selectDiscussion,
  selectMassInvitations,
  selectMeetingMembers,
  selectMeetingSettings,
  selectNewFeatures,
  selectNewMeetings,
  selectNotifications,
  selectOrganizations,
  selectReflectPrompts,
  selectRetroReflections,
  selectSlackAuths,
  selectSlackNotifications,
  selectSuggestedAction,
  selectTasks,
  selectTeamInvitations,
  selectTeamPromptResponses,
  selectTeams,
  selectTemplateDimension,
  selectTemplateScale,
  selectTemplateScaleRef,
  selectTimelineEvent
} from '../postgres/select'
import {TeamNotificationSettings} from '../postgres/types/pg'
import {primaryKeyLoaderMaker} from './primaryKeyLoaderMaker'

export const users = primaryKeyLoaderMaker(getUsersByIds)

export const teams = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTeams().where('id', 'in', ids).execute()
})
export const discussions = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectDiscussion().where('id', 'in', ids).execute()
})
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

export const newMeetings = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectNewMeetings().where('id', 'in', ids).execute()
})

export const meetingMembers = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectMeetingMembers().where('id', 'in', ids).execute()
})

export const massInvitations = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectMassInvitations().where('id', 'in', ids).execute()
})

export const newFeatures = primaryKeyLoaderMaker((ids: readonly number[]) => {
  return selectNewFeatures().where('id', 'in', ids).execute()
})

export const teamInvitations = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTeamInvitations().where('id', 'in', ids).execute()
})

export const tasks = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectTasks().where('id', 'in', ids).execute()
})

export const notifications = primaryKeyLoaderMaker((ids: readonly string[]) => {
  return selectNotifications().where('id', 'in', ids).execute()
})

export const teamMemberIntegrationAuths = primaryKeyLoaderMaker((ids: readonly number[]) => {
  return getKysely()
    .selectFrom('TeamMemberIntegrationAuth')
    .selectAll()
    .where('id', 'in', ids)
    .execute()
})

export const teamNotificationSettings = primaryKeyLoaderMaker((ids: readonly number[]) => {
  return (
    getKysely()
      .selectFrom('TeamNotificationSettings')
      .selectAll()
      // convert to text[] as kysely would otherwise not parse the array
      .select(sql<TeamNotificationSettings['events']>`events::text[]`.as('events'))
      .where('id', 'in', ids)
      .execute()
  )
})
