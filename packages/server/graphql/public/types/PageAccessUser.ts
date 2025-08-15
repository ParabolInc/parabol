import type {PageAccessUserResolvers} from '../resolverTypes'

const PageAccessUser: PageAccessUserResolvers = {
  user: async ({userId}, _args, {dataLoader}) => {
    const user = await dataLoader.get('users').loadNonNull(userId)
    return {
      ...user,
      id: `preview:${user.id}`
    }
  }
}

export default PageAccessUser
