import getPg from '../getPg'
import {
  getAtlassianAuthByUserIdQuery,
  IGetAtlassianAuthByUserIdQueryResult
} from './generated/getAtlassianAuthByUserId'

export interface AtlassianAuth
  extends Omit<IGetAtlassianAuthByUserIdQueryResult, 'jiraSearchQueries'> {
  jiraSearchQueries: {
    id: string
    queryString: string
    projectKeyFilters?: string[]
    lastUsedAt: Date
    isJQL: boolean
  }[]
}

const getAtlassianAuthByUserId = async (userId: string) => {
  const res = await getAtlassianAuthByUserIdQuery.run({userId}, getPg())
  if (!res || res.length === 0) return []
  return res.map((atlassianAuth) => ({
    ...atlassianAuth,
    jiraSearchQueries: atlassianAuth.jiraSearchQueries.map((jsq: any) => ({
      ...jsq,
      lastUsedAt: new Date(jsq.lastUsedAt)
    }))
  })) as AtlassianAuth[]
}

export default getAtlassianAuthByUserId
