import getPg from '../getPg'
import {getAtlassianAuthByUserIdTeamIdQuery} from './generated/getAtlassianAuthByUserIdTeamIdQuery'

const getAtlassianAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getAtlassianAuthByUserIdTeamIdQuery.run({teamId, userId}, getPg())
  return res
}

export default getAtlassianAuthByUserIdTeamId
