import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {feistelCipher} from '../../../utils/feistelCipher'
import {MutationResolvers} from '../resolverTypes'

const createPage: MutationResolvers['createPage'] = async (
  _source,
  {parentPageId, teamId},
  {authToken, dataLoader}
) => {
  if (parentPageId && teamId) {
    throw new GraphQLError('Can only provider either parentPageId OR teamId')
  }
  const userId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(userId)
  const dbParentPageId = parentPageId
    ? feistelCipher.decrypt(Number(parentPageId.split(':')[1]))
    : undefined
  const page = await getKysely()
    .insertInto('Page')
    .values({userId, parentPageId: dbParentPageId, teamId})
    .returningAll()
    .executeTakeFirstOrThrow()
  analytics.pageCreated(viewer, page.id)
  return {page}
}

export default createPage
