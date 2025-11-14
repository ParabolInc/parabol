import {GraphQLError} from 'graphql'
import AuthToken from '../../../database/types/AuthToken'
import {setAuthCookie} from '../../../utils/authCookie'
import {MutationResolvers} from '../resolverTypes'

const refreshSession: MutationResolvers['refreshSession'] = async (_source, {}, context) => {
  const {authToken} = context
  const {rol, sub, tms} = authToken!

  if (rol === 'impersonate') {
    throw new GraphQLError('Cannot refresh an impersonation session')
  }

  context.authToken = new AuthToken({
    sub,
    rol,
    tms
  })
  setAuthCookie(context, context.authToken!)
  return true
}

export default refreshSession
