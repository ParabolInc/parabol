import getPg from '../getPg'
import {
  getAtlassianAuthByUserIdTeamIdQuery,
  IGetAtlassianAuthByUserIdTeamIdQueryResult
} from './generated/getAtlassianAuthByUserIdTeamIdQuery'

export interface AtlassianAuth
  extends Omit<IGetAtlassianAuthByUserIdTeamIdQueryResult, 'jiraSearchQueries'> {
  jiraSearchQueries: {
    id: string
    queryString: string
    projectKeyFilters?: string[]
    lastUsedAt: Date
    isJQL: boolean
  }[]
}

const getAtlassianAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [res] = await getAtlassianAuthByUserIdTeamIdQuery.run({teamId, userId}, getPg())
  if (!res) return null
  return {
    ...res,
    jiraSearchQueries: res.jiraSearchQueries.map((jsq: any) => ({
      ...jsq,
      lastUsedAt: new Date(jsq.lastUsedAt)
    }))
  } as AtlassianAuth
}

export default getAtlassianAuthByUserIdTeamId
