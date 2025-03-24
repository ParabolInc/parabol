import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {UserResolvers} from '../resolverTypes'

export const aiPrompts: NonNullable<UserResolvers['aiPrompts']> = async (
  _source,
  _args,
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()
  const aiPrompts = await pg
    .selectFrom('AIPrompt')
    .selectAll()
    .where('userId', 'in', [viewerId, 'aGhostUser'])
    .orderBy('lastUsedAt', 'desc')
    .execute()
  return aiPrompts
}
