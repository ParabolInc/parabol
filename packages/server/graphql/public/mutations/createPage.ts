import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const createPage: MutationResolvers['createPage'] = async (_source, _args, {authToken}) => {
  const userId = getUserId(authToken)
  const page = await getKysely()
    .insertInto('Page')
    .values({userId})
    .returningAll()
    .executeTakeFirstOrThrow()
  return {page}
}

export default createPage
