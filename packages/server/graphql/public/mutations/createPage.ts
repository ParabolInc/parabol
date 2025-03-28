import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const createPage: MutationResolvers['createPage'] = async (
  _source,
  _args,
  {authToken, dataLoader}
) => {
  const userId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(userId)
  const page = await getKysely()
    .insertInto('Page')
    .values({userId})
    .returningAll()
    .executeTakeFirstOrThrow()
  analytics.pageCreated(viewer, page.id)
  return {page}
}

export default createPage
