import getKysely from '../postgres/getKysely'
import {foreignKeyLoaderMaker} from './foreignKeyLoaderMaker'
import {selectOrganizations, selectRetroReflections, selectTeams} from './primaryKeyLoaderMakers'

export const teamsByOrgIds = foreignKeyLoaderMaker('teams', 'orgId', (orgIds) =>
  selectTeams().where('orgId', 'in', orgIds).where('isArchived', '=', false).execute()
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
    const pg = getKysely()
    return pg
      .selectFrom('TimelineEvent')
      .selectAll()
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
