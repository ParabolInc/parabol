import {
  getTeamsByOrgIdsQuery,
  IGetTeamsByOrgIdsQueryParams,
  IGetTeamsByOrgIdsQueryResult
} from './generated/getTeamsByOrgIdsQuery'
import getPg from '../getPg'

const getTeamsByOrgIds = (
  orgIds: string[],
  options: {isArchived?: boolean} = {}
): Promise<IGetTeamsByOrgIdsQueryResult[]> => {
  const {isArchived} = options
  const queryParameters: IGetTeamsByOrgIdsQueryParams = {
    orgIds,
    isArchived: !!isArchived
  }
  return getTeamsByOrgIdsQuery.run(queryParameters, getPg())
}

export default getTeamsByOrgIds
