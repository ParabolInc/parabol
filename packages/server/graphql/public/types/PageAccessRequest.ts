import getKysely from '../../../postgres/getKysely'
import type {PageAccessRequestResolvers} from '../resolverTypes'

const PageAccessRequest: PageAccessRequestResolvers = {
  user: async ({userId}) => {
    const pg = getKysely()
    const user = await pg
      .selectFrom('User')
      .select(['id', 'email', 'preferredName', 'picture'])
      .where('id', '=', userId)
      .executeTakeFirst()
    return user!
  }
}

export default PageAccessRequest
