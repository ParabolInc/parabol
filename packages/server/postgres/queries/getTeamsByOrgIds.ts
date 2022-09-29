import getPg from '../getPg'
import {getTeamsByOrgIdsQuery} from './generated/getTeamsByOrgIdsQuery'
import {mapToTeam} from './getTeamsByIds'

const getTeamsByOrgIds = async (
  orgIds: string[] | readonly string[],
  options: {isArchived?: boolean} = {}
) => {
  const {isArchived} = options
  const queryParameters = {
    orgIds,
    isArchived: !!isArchived
  }
  const teams = await getTeamsByOrgIdsQuery.run(queryParameters as any, getPg())
  return mapToTeam(teams)
}

export default getTeamsByOrgIds
