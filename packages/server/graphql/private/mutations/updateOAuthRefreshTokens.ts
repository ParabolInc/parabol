import {selectTeamMemberIntegrationAuth} from '../../../postgres/select'
import type {MutationResolvers} from '../resolverTypes'

// auth.atlassian.com throttles a burst of thousands of refreshes, answering with non-JSON pages and dropped connections
const MAX_CONCURRENT_REFRESHES = 3

const updateOAuthRefreshTokens: MutationResolvers['updateOAuthRefreshTokens'] = async (
  _source,
  {updatedBefore},
  {dataLoader}
) => {
  // RESOLUTION
  const atlassianAuthRows = await selectTeamMemberIntegrationAuth()
    .select(['userId', 'teamId'])
    .where('service', '=', 'jira')
    .where('updatedAt', '<=', updatedBefore)
    .where('isActive', '=', true)
    .execute()
  // distinct on userId, since freshAtlassianAuth will renew all active tokens across all teams for a user
  const atlassianAuthsToUpdate = [
    ...new Map(atlassianAuthRows.map((row) => [row.userId, row])).values()
  ]
  let refreshedCount = 0
  const refreshUntilNoneRemain = async () => {
    for (let key = atlassianAuthsToUpdate.pop(); key; key = atlassianAuthsToUpdate.pop()) {
      const auth = await dataLoader.get('freshAtlassianAuth').load(key)
      if (auth) refreshedCount++
    }
  }
  await Promise.all(Array.from({length: MAX_CONCURRENT_REFRESHES}, refreshUntilNoneRemain))
  return refreshedCount
}

export default updateOAuthRefreshTokens
