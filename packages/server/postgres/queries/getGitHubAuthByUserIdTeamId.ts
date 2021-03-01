import getPg from '../getPg'
import {getGitHubAuthByUserIdTeamIdQuery} from './generated/getGitHubAuthByUserIdTeamIdQuery'

const getGitHubAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getGitHubAuthByUserIdTeamIdQuery.run({teamId, userId}, getPg())
  return res
}
export default getGitHubAuthByUserIdTeamId
