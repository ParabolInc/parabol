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
    lastUsedAt?: Date
    isJQL: boolean
  }[]
}

const getAtlassianAuthByUserIdTeamId = async (userId: string, teamId: string) => {
  const [
    {
      accessToken,
      refreshToken,
      createdAt,
      updatedAt,
      isActive,
      jiraSearchQueries,
      cloudIds,
      scope,
      accountId
    }
  ] = await getAtlassianAuthByUserIdTeamIdQuery.run({teamId, userId}, getPg())

  return {
    accessToken,
    refreshToken,
    createdAt,
    updatedAt,
    isActive,
    cloudIds,
    scope,
    accountId,
    teamId,
    userId,
    jiraSearchQueries: jiraSearchQueries.map((jsq: any) => {
      return {
        id: jsq.id,
        queryString: jsq.queryString,
        projectKeyFilters: jsq.projectKeyFilters,
        lastUsedAt: jsq.lastUsedAt ? new Date(jsq.lastUsedAt) : undefined,
        isJQL: jsq.isJQL
      }
    })
  } as AtlassianAuth
}

export default getAtlassianAuthByUserIdTeamId
