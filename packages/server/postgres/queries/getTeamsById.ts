import {getTeamsByIdQuery, IGetTeamsByIdQueryResult} from './generated/getTeamsByIdQuery'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'

export interface IGetTeamsByIdResult extends IGetTeamsByIdQueryResult {}

const getTeamsById = async (teamIds: string[]) => {
  return await catchAndLog(() => getTeamsByIdQuery.run({ids: teamIds}, getPg()))
}

export default getTeamsById
