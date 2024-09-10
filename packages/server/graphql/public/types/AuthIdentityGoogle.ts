import {AuthIdentityGoogleResolvers} from '../resolverTypes'

const AuthIdentityGoogle: AuthIdentityGoogleResolvers = {
  __isTypeOf: ({type}) => type === 'GOOGLE'
}

export default AuthIdentityGoogle
