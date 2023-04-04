import getTeamIdsByOrgIds from '../../../../postgres/queries/getTeamIdsByOrgIds'
import getActiveTeamCountByTeamIds from './getActiveTeamCountByTeamIds'

// Active team is the team that completed 3 meetings with more than 1 attendee
// and have had at least 1 meeting in the last 30 days
// Warning: the query is very expensive
// TODO: we need to store all calculations in the database, e.g. attendeeCount

const getActiveTeamCountByOrgIds = async (orgIds: string | string[]) => {
  const organizationIds = Array.isArray(orgIds) ? orgIds : [orgIds]
  const teamIds = await getTeamIdsByOrgIds(organizationIds)
  return getActiveTeamCountByTeamIds(teamIds)
}

export default getActiveTeamCountByOrgIds
