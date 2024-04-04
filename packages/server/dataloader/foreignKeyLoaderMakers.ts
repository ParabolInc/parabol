import getKysely from '../postgres/getKysely'
import getTeamsByOrgIds from '../postgres/queries/getTeamsByOrgIds'
import {foreignKeyLoaderMaker} from './foreignKeyLoaderMaker'

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
