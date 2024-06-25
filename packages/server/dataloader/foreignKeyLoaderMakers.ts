import getKysely from '../postgres/getKysely'
import getTeamsByOrgIds from '../postgres/queries/getTeamsByOrgIds'
import {foreignKeyLoaderMaker} from './foreignKeyLoaderMaker'
import {selectRetroReflections} from './primaryKeyLoaderMakers'

export const teamsByOrgIds = foreignKeyLoaderMaker('teams', 'orgId', (orgIds) =>
  getTeamsByOrgIds(orgIds, {isArchived: false})
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
