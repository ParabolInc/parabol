import getPg from '../getPg'
import {
  getAtlassianAuthByUserIdTeamIdQuery,
  IGetAtlassianAuthByUserIdTeamIdQueryResult
} from './generated/getAtlassianAuthByUserIdTeamIdQuery'

interface AtlassianAuth
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

  return {
    ...res,
    jiraSearchQueries: res.jiraSearchQueries.map((jsq: any) => {
      return {
        id: jsq.id,
        queryString: jsq.queryString,
        projectKeyFilters: jsq.projectKeyFilters,
        lastUsedAt: new Date(jsq.lastUsedAt),
        isJQL: jsq.isJQL
      }
    })
  } as AtlassianAuth
}

export default getAtlassianAuthByUserIdTeamId
