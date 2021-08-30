import {getTeamsByIdsQuery} from './generated/getTeamsByIdsQuery'
import getPg from '../getPg'

const getTeamsByIds = async (teamIds: string[] | readonly string[]) => {
  return getTeamsByIdsQuery.run({ids: teamIds} as any, getPg())
}

export default getTeamsByIds
