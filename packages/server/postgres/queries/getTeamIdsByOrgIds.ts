import getPg from '../getPg'
import {getTeamIdsByOrgIdsQuery} from './generated/getTeamIdsByOrgIdsQuery'

const getTeamIdsByOrgIds = async (
  orgIds: string[] | readonly string[],
  options: {isArchived?: boolean} = {}
) => {
  const {isArchived} = options
  const queryParameters = {
    orgIds,
    isArchived: !!isArchived
  }
  const teamIds = await getTeamIdsByOrgIdsQuery.run(queryParameters as any, getPg())
  console.log('teamIds', teamIds)

  return teamIds.map((team) => team.id)
}

export default getTeamIdsByOrgIds
