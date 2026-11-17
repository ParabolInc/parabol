import type {PageAccessUserResolvers} from '../resolverTypes'

const PageAccessUser: PageAccessUserResolvers = {
  user: ({userId}, _args, {dataLoader}) => dataLoader.get('users').loadNonNull(userId)
}

export default PageAccessUser
