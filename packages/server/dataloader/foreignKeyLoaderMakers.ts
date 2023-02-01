import getPg from '../postgres/getPg'
import {getActiveMeetingSeriesByTeamIdsQuery} from '../postgres/queries/generated/getActiveMeetingSeriesByTeamIdsQuery'
import getTeamsByOrgIds from '../postgres/queries/getTeamsByOrgIds'
import {foreignKeyLoaderMaker} from './foreignKeyLoaderMaker'

export const teamsByOrgIds = foreignKeyLoaderMaker('teams', 'orgId', (orgIds) =>
  getTeamsByOrgIds(orgIds, {isArchived: false})
)

export const meetingSeriesByTeamIds = foreignKeyLoaderMaker('meetingSeries', 'teamId', (teamIds) =>
  getActiveMeetingSeriesByTeamIdsQuery.run({teamIds}, getPg())
)
