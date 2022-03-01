import getPg from '../getPg'
import {
  getGitHubAuthByUserIdTeamIdQuery,
  IGetGitHubAuthByUserIdTeamIdQueryResult
} from './generated/getGitHubAuthByUserIdTeamIdQuery'

// if we want to query multiple userIds/teamIds, just call this multiple times

export interface GitHubSearchQuery {
  id: string
  queryString: string
  lastUsedAt: Date
}
export interface GitHubAuth
  extends Omit<IGetGitHubAuthByUserIdTeamIdQueryResult, 'githubSearchQueries'> {
  isActive: true
  githubSearchQueries: GitHubSearchQuery[]
}

const getGitHubAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getGitHubAuthByUserIdTeamIdQuery.run({teamId, userId}, getPg())
  if (!res) return null
  res.githubSearchQueries.forEach((query) => {
    ;(query as any).lastUsedAt = new Date((query as any).lastUsedAt)
  })
  return res as any as GitHubAuth
}
export default getGitHubAuthByUserIdTeamId
