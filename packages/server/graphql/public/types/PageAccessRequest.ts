import type {PageAccessRequestResolvers} from '../resolverTypes'

const PageAccessRequest: PageAccessRequestResolvers = {
  user: ({userId}, _args, {dataLoader}) => dataLoader.get('users').loadNonNull(userId)
}

export default PageAccessRequest
