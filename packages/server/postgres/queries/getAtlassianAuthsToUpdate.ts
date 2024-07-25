import getPg from '../getPg'
import {getAtlassianAuthsToUpdateQuery} from './generated/getAtlassianAuthsToUpdateQuery'
import {AtlassianAuth} from './getAtlassianAuthByUserIdTeamId'

const getAtlassianAuthsToUpdate = async (updatedAtThreshold: Date) => {
  const results = await getAtlassianAuthsToUpdateQuery.run({updatedAtThreshold}, getPg())
  return results.map(
    (atlassianAuth) =>
      ({
        ...atlassianAuth,
        jiraSearchQueries: atlassianAuth.jiraSearchQueries.map((jsq: any) => ({
          ...jsq,
          lastUsedAt: new Date(jsq.lastUsedAt)
        }))
      }) as AtlassianAuth
  )
}

export default getAtlassianAuthsToUpdate
