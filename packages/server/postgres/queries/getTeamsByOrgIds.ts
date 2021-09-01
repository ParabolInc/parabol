import {
  getTeamsByOrgIdsQuery,
  IGetTeamsByOrgIdsQueryResult
} from './generated/getTeamsByOrgIdsQuery'
import getPg from '../getPg'

const getTeamsByOrgIds = (
  orgIds: string[] | readonly string[],
  options: {isArchived?: boolean} = {}
): Promise<IGetTeamsByOrgIdsQueryResult[]> => {
  const {isArchived} = options
  const queryParameters = {
    orgIds,
    isArchived: !!isArchived
  }
  return getTeamsByOrgIdsQuery.run(queryParameters as any, getPg())
}

export default getTeamsByOrgIds
