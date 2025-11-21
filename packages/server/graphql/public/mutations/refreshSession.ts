import {GraphQLError} from 'graphql'
import AuthToken from '../../../database/types/AuthToken'
import {setAuthCookie} from '../../../utils/authCookie'
import {MutationResolvers} from '../resolverTypes'

const refreshSession: MutationResolvers['refreshSession'] = async (_source, {}, context) => {
  const {authToken, dataLoader} = context
  const {rol, sub} = authToken!

  if (rol === 'impersonate') {
    throw new GraphQLError('Cannot refresh an impersonation session')
  }

  const user = await dataLoader.get('users').load(sub)
  if (!user) {
    throw new GraphQLError('User not found')
  }

  context.authToken = new AuthToken({
    sub,
    rol: user.rol,
    tms: user.tms
  })
  setAuthCookie(context, context.authToken!)
  return true
}

export default refreshSession
