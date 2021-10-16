import getPg from '../getPg'
import {
  getMattermostAuthByTeamIdQuery,
  IGetMattermostAuthByTeamIdQueryResult
} from './generated/getMattermostAuthByTeamIdQuery'

export interface GetMattermostAuthByTeamIdResult extends IGetMattermostAuthByTeamIdQueryResult {
  isActive: true
}
const getMattermostAuthByTeamId = async (teamId: string) => {
  const [res] = await getMattermostAuthByTeamIdQuery.run({teamId}, getPg())
  return res as GetMattermostAuthByTeamIdResult
}
export default getMattermostAuthByTeamId
