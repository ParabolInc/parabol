import {
  getTeamsByOrgIdQuery,
  IGetTeamsByOrgIdQueryParams,
  IGetTeamsByOrgIdQueryResult
} from './generated/getTeamsByOrgIdQuery'
import getPg from '../getPg'

const getTeamsByOrgIds = async (
  orgIds: string[],
  options: {isArchived?: boolean} = {}
): Promise<IGetTeamsByOrgIdQueryResult[]> => {
  const {isArchived} = options
  const queryParameters: IGetTeamsByOrgIdQueryParams = {
    orgIds,
    isArchived: !!isArchived
  }
  const teams = await getTeamsByOrgIdQuery.run(queryParameters, getPg())
  return teams === null ? [] : teams
}

export default getTeamsByOrgIds
