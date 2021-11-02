import getPg from '../getPg'
import {
  getMattermostBestAuthByUserIdTeamIdQuery,
  IGetMattermostBestAuthByUserIdTeamIdQueryResult
} from './generated/getMattermostBestAuthByUserIdTeamIdQuery'

export interface GetMattermostBestAuthByUserIdTeamIdResult
  extends IGetMattermostBestAuthByUserIdTeamIdQueryResult {
  isActive: true
}
const getMattermostBestAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getMattermostBestAuthByUserIdTeamIdQuery.run({userId, teamId}, getPg())
  return res as GetMattermostBestAuthByUserIdTeamIdResult
}
export default getMattermostBestAuthByUserIdTeamId
