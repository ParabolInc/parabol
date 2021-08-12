import {
  getTeamsByOrgIdQuery,
  IGetTeamsByOrgIdQueryParams,
  IGetTeamsByOrgIdQueryResult
} from './generated/getTeamsByOrgIdQuery'
import getPg from '../getPg'

const getTeamsByOrgIds = async (
  orgIds: string[],
  options: Partial<Omit<IGetTeamsByOrgIdQueryParams, 'orgId'>> = {}
): Promise<IGetTeamsByOrgIdQueryResult[]> => {
  const {isArchived, ...otherOptions} = options
  const queryParameters: IGetTeamsByOrgIdQueryParams = {
    orgIds,
    isArchived: !!isArchived,
    ...otherOptions
  }
  const teams = await getTeamsByOrgIdQuery.run(queryParameters, getPg())
  return teams === null ? [] : teams
}

export default getTeamsByOrgIds
