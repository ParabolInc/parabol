import getPg from '../getPg'
import {
  getGitHubAuthByUserIdTeamIdQuery,
  IGetGitHubAuthByUserIdTeamIdQueryResult
} from './generated/getGitHubAuthByUserIdTeamIdQuery'

// this table has a composite primary key (userId, teamId),
// which cannot use the index with a WHERE IN or JOIN on VALUES
// so if we want to query multiple userIds/teamIds, just call this multiple times
export interface GitHubAuth
  extends Omit<IGetGitHubAuthByUserIdTeamIdQueryResult, 'githubSearchQueries'> {
  isActive: true
  githubSearchQueries: {queryString: string; lastUsedAt: Date}[]
}

const getGitHubAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getGitHubAuthByUserIdTeamIdQuery.run({teamId, userId}, getPg())
  if (!res) return res
  res.githubSearchQueries.forEach((query) => {
    ;(query as any).lastUsedAt = new Date((query as any).lastUsedAt)
  })
  return (res as any) as GitHubAuth
}
export default getGitHubAuthByUserIdTeamId
