import {getTeamsByIdQuery, IGetTeamsByIdQueryResult} from './generated/getTeamsByIdQuery'
import getPg from '../getPg'

export interface IGetTeamsByIdResult extends IGetTeamsByIdQueryResult {}

const getTeamsById = async (teamIds: string[] | readonly string[]) => {
  return await getTeamsByIdQuery.run({ids: teamIds} as any, getPg())
}

export default getTeamsById
