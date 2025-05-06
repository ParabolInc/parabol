import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import {getTeamPromptResponsesByMeetingIds} from '../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {
  selectAgendaItems,
  selectComments,
  selectMassInvitations,
  selectMeetingMembers,
  selectNewMeetings,
  selectOrganizations,
  selectReflectPrompts,
  selectRetroReflections,
  selectSlackAuths,
  selectSlackNotifications,
  selectSuggestedAction,
  selectTasks,
  selectTeamInvitations,
  selectTeams,
  selectTemplateDimension,
  selectTemplateScale,
  selectTimelineEvent
} from '../postgres/select'
import {foreignKeyLoaderMaker} from './foreignKeyLoaderMaker'

export const teamsByOrgIds = foreignKeyLoaderMaker('teams', 'orgId', (orgIds) =>
  selectTeams().where('orgId', 'in', orgIds).where('isArchived', '=', false).execute()
)

export const teamMembersByTeamId = foreignKeyLoaderMaker('teamMembers', 'teamId', (teamIds) =>
  getKysely()
    .selectFrom('TeamMember')
    .selectAll()
    .where('teamId', 'in', teamIds)
    .where('isNotRemoved', '=', true)
    .execute()
)

export const teamMembersByUserId = foreignKeyLoaderMaker('teamMembers', 'userId', (userIds) =>
  getKysely()
    .selectFrom('TeamMember')
    .selectAll()
    .where('userId', 'in', userIds)
    .where('isNotRemoved', '=', true)
    .execute()
)
export const discussionsByMeetingId = foreignKeyLoaderMaker(
  'discussions',
  'meetingId',
  async (meetingIds) => {
    const pg = getKysely()
    return pg.selectFrom('Discussion').selectAll().where('meetingId', 'in', meetingIds).execute()
  }
)

export const embeddingsMetadataByRefId = foreignKeyLoaderMaker(
  'embeddingsMetadata',
  'refId',
  async (refId) => {
    const pg = getKysely()
    return pg.selectFrom('EmbeddingsMetadata').selectAll().where('refId', 'in', refId).execute()
  }
)

export const retroReflectionGroupsByMeetingId = foreignKeyLoaderMaker(
  'retroReflectionGroups',
  'meetingId',
  async (meetingIds) => {
    const pg = getKysely()
    return pg
      .selectFrom('RetroReflectionGroup')
      .selectAll()
      .where('meetingId', 'in', meetingIds)
      .where('isActive', '=', true)
      .execute()
  }
)

export const retroReflectionsByMeetingId = foreignKeyLoaderMaker(
  'retroReflections',
  'meetingId',
  async (meetingIds) => {
    return selectRetroReflections()
      .where('meetingId', 'in', meetingIds)
      .where('isActive', '=', true)
      .execute()
  }
)

export const retroReflectionsByGroupId = foreignKeyLoaderMaker(
  'retroReflections',
  'reflectionGroupId',
  async (reflectionGroupIds) => {
    return selectRetroReflections()
      .where('reflectionGroupId', 'in', reflectionGroupIds)
      .where('isActive', '=', true)
      .execute()
  }
)

export const timelineEventsByMeetingId = foreignKeyLoaderMaker(
  'timelineEvents',
  'meetingId',
  async (meetingIds) => {
    return selectTimelineEvent()
      .where('meetingId', 'in', meetingIds)
      .where('isActive', '=', true)
      .execute()
  }
)

export const organizationsByActiveDomain = foreignKeyLoaderMaker(
  'organizations',
  'activeDomain',
  async (activeDomains) => {
    return selectOrganizations().where('activeDomain', 'in', activeDomains).execute()
  }
)

export const organizationUsersByUserId = foreignKeyLoaderMaker(
  'organizationUsers',
  'userId',
  async (userIds) => {
    return getKysely()
      .selectFrom('OrganizationUser')
      .selectAll()
      .where('userId', 'in', userIds)
      .where('removedAt', 'is', null)
      .execute()
  }
)

export const organizationUsersByOrgId = foreignKeyLoaderMaker(
  'organizationUsers',
  'orgId',
  async (orgIds) => {
    return getKysely()
      .selectFrom('OrganizationUser')
      .selectAll()
      .where('orgId', 'in', orgIds)
      .where('removedAt', 'is', null)
      .execute()
  }
)

export const scalesByTeamId = foreignKeyLoaderMaker('templateScales', 'teamId', async (teamIds) => {
  return selectTemplateScale()
    .where('teamId', 'in', teamIds)
    .orderBy(['isStarter', 'name'])
    .execute()
})

export const templateDimensionsByTemplateId = foreignKeyLoaderMaker(
  'templateDimensions',
  'templateId',
  async (templateIds) => {
    return selectTemplateDimension()
      .where('templateId', 'in', templateIds)
      .orderBy('sortOrder')
      .execute()
  }
)

export const templateDimensionsByScaleId = foreignKeyLoaderMaker(
  'templateDimensions',
  'scaleId',
  async (scaleIds) => {
    return selectTemplateDimension().where('scaleId', 'in', scaleIds).orderBy('sortOrder').execute()
  }
)

export const suggestedActionsByUserId = foreignKeyLoaderMaker(
  'suggestedActions',
  'userId',
  async (userIds) => {
    return selectSuggestedAction().where('userId', 'in', userIds).execute()
  }
)

export const teamPromptResponsesByMeetingId = foreignKeyLoaderMaker(
  'teamPromptResponses',
  'meetingId',
  getTeamPromptResponsesByMeetingIds
)

export const agendaItemsByTeamId = foreignKeyLoaderMaker(
  'agendaItems',
  'teamId',
  async (teamIds) => {
    return selectAgendaItems()
      .where('teamId', 'in', teamIds)
      .where('isActive', '=', true)
      .orderBy('sortOrder')
      .execute()
  }
)

export const agendaItemsByMeetingId = foreignKeyLoaderMaker(
  'agendaItems',
  'meetingId',
  async (meetingIds) => {
    return selectAgendaItems().where('meetingId', 'in', meetingIds).orderBy('sortOrder').execute()
  }
)

export const slackAuthByUserId = foreignKeyLoaderMaker('slackAuths', 'userId', async (userIds) => {
  return selectSlackAuths().where('userId', 'in', userIds).execute()
})

export const slackNotificationsByTeamId = foreignKeyLoaderMaker(
  'slackNotifications',
  'teamId',
  async (teamIds) => {
    return selectSlackNotifications().where('teamId', 'in', teamIds).execute()
  }
)

export const commentsByDiscussionId = foreignKeyLoaderMaker(
  'comments',
  'discussionId',
  async (discussionIds) => {
    // include deleted comments so we can replace them with tombstones
    return selectComments().where('discussionId', 'in', discussionIds).execute()
  }
)

export const reflectPromptsByTemplateId = foreignKeyLoaderMaker(
  'reflectPrompts',
  'templateId',
  async (templateIds) => {
    return selectReflectPrompts()
      .where('templateId', 'in', templateIds)
      .orderBy('sortOrder')
      .execute()
  }
)

export const activeMeetingsByTeamId = foreignKeyLoaderMaker(
  'newMeetings',
  'teamId',
  async (teamIds) => {
    return selectNewMeetings()
      .where('teamId', 'in', teamIds)
      .where('endedAt', 'is', null)
      .orderBy('createdAt', 'desc')
      .execute()
  }
)
export const completedMeetingsByTeamId = foreignKeyLoaderMaker(
  'newMeetings',
  'teamId',
  async (teamIds) => {
    return selectNewMeetings()
      .where('teamId', 'in', teamIds)
      .where('endedAt', 'is not', null)
      .orderBy('endedAt', 'desc')
      .execute()
  }
)

export const meetingMembersByMeetingId = foreignKeyLoaderMaker(
  'meetingMembers',
  'meetingId',
  async (meetingIds) => {
    return selectMeetingMembers().where('meetingId', 'in', meetingIds).execute()
  }
)

export const meetingMembersByUserId = foreignKeyLoaderMaker(
  'meetingMembers',
  'userId',
  async (userIds) => {
    return selectMeetingMembers().where('userId', 'in', userIds).execute()
  }
)

export const massInvitationsByTeamMemberId = foreignKeyLoaderMaker(
  'massInvitations',
  'teamMemberId',
  async (teamMemberIds) => {
    return selectMassInvitations()
      .where('teamMemberId', 'in', teamMemberIds)
      .orderBy('expiration', 'desc')
      .execute()
  }
)

export const teamInvitationsByTeamId = foreignKeyLoaderMaker(
  'teamInvitations',
  'teamId',
  async (teamIds) => {
    return selectTeamInvitations()
      .where('teamId', 'in', teamIds)
      .where('acceptedAt', 'is', null)
      .where('expiresAt', '>=', sql<Date>`CURRENT_TIMESTAMP`)
      .execute()
  }
)

export const tasksByDiscussionId = foreignKeyLoaderMaker(
  'tasks',
  'discussionId',
  async (discusisonIds) => {
    // include archived cards in the conversation, since it's persistent
    return selectTasks().where('discussionId', 'in', discusisonIds).execute()
  }
)

export const tasksByTeamId = foreignKeyLoaderMaker('tasks', 'teamId', async (teamIds) => {
  // waraning! contains private tasks
  return selectTasks()
    .where('teamId', 'in', teamIds)
    .where(sql<boolean>`'archived' != ALL(tags)`)
    .execute()
})

export const tasksByMeetingId = foreignKeyLoaderMaker('tasks', 'meetingId', async (meetingIds) => {
  // waraning! contains private tasks
  return selectTasks()
    .where('meetingId', 'in', meetingIds)
    .where(sql<boolean>`'archived' != ALL(tags)`)
    .execute()
})

export const tasksByIntegrationHash = foreignKeyLoaderMaker(
  'tasks',
  'integrationHash',
  async (integrationHashes) => {
    // waraning! contains private tasks
    return selectTasks().where('integrationHash', 'in', integrationHashes).execute()
  }
)
