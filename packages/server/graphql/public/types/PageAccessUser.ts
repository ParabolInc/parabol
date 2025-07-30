import type {PageAccessUserResolvers} from '../resolverTypes'

const PageAccessUser: PageAccessUserResolvers = {
  user: async ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default PageAccessUser
