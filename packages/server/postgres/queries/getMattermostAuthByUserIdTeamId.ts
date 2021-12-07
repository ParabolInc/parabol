import getPg from '../getPg'
import {
  getMattermostAuthByUserIdTeamIdQuery,
  IGetMattermostAuthByUserIdTeamIdQueryResult
} from './generated/getMattermostAuthByUserIdTeamIdQuery'

// if we want to query multiple userIds/teamIds, just call this multiple times
export interface GetMattermostAuthByUserIdTeamIdResult
  extends IGetMattermostAuthByUserIdTeamIdQueryResult {
  isActive: true
}
const getMattermostAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getMattermostAuthByUserIdTeamIdQuery.run({userId, teamId}, getPg())
  return res as GetMattermostAuthByUserIdTeamIdResult | undefined
}
export default getMattermostAuthByUserIdTeamId
