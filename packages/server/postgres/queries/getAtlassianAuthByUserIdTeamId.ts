import getPg from '../getPg'
import {
  getAtlassianAuthByUserIdTeamIdQuery,
  IGetAtlassianAuthByUserIdTeamIdQueryResult
} from './generated/getAtlassianAuthByUserIdTeamIdQuery'

interface AtlassianAuth
  extends Omit<IGetAtlassianAuthByUserIdTeamIdQueryResult, 'jiraSearchQueries'> {
  jiraSearchQueries: {
    queryString: string
    projectKeyFilters?: string[]
    lastUsedAt?: string
    isJQL: boolean
  }[]
}

const getAtlassianAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getAtlassianAuthByUserIdTeamIdQuery.run({teamId, userId}, getPg())
  return res as AtlassianAuth
}

export default getAtlassianAuthByUserIdTeamId
