import {unsetAuthCookie} from '../../../utils/authCookie'
import {MutationResolvers} from '../resolverTypes'

const signOut: MutationResolvers['signOut'] = async (_source, {}, context) => {
  unsetAuthCookie(context)
  // TODO disconnect all sockets
  return true
}

export default signOut
