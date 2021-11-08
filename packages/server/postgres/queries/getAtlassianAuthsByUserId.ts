import getPg from '../getPg'
import {getAtlassianAuthsByUserIdQuery} from './generated/getAtlassianAuthsByUserId'
import {AtlassianAuth} from './getAtlassianAuthByUserIdTeamId'

const getAtlassianAuthsByUserId = async (userId: string) => {
  const res = await getAtlassianAuthsByUserIdQuery.run({userId}, getPg())
  if (!res || res.length === 0) return []
  return res.map((atlassianAuth) => ({
    ...atlassianAuth,
    jiraSearchQueries: atlassianAuth.jiraSearchQueries.map((jsq: any) => ({
      ...jsq,
      lastUsedAt: new Date(jsq.lastUsedAt)
    }))
  })) as AtlassianAuth[]
}

export default getAtlassianAuthsByUserId
