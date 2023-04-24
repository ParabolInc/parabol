import getPg from '../getPg'
import {getTeamIdsByOrgIdsQuery} from './generated/getTeamIdsByOrgIdsQuery'

const getTeamIdsByOrgIds = async (orgIds: string[] | readonly string[], isArchived?: boolean) => {
  const queryParameters = {
    orgIds,
    isArchived: !!isArchived
  }
  const teamIds = await getTeamIdsByOrgIdsQuery.run(queryParameters, getPg())

  return teamIds.map((team) => team.id)
}

export default getTeamIdsByOrgIds
