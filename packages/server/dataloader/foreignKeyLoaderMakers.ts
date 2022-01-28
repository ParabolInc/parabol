import getTeamsByOrgIds from '../postgres/queries/getTeamsByOrgIds'
import {foreignKeyLoaderMaker} from './foreignKeyLoaderMaker'

export const teamsByOrgIds = foreignKeyLoaderMaker('teams', 'orgId', (orgIds) =>
  getTeamsByOrgIds(orgIds, {isArchived: false})
)
