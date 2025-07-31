import type {AuthIdentityLocalResolvers} from '../resolverTypes'

const AuthIdentityLocal: AuthIdentityLocalResolvers = {
  __isTypeOf: ({type}) => type === 'LOCAL'
}

export default AuthIdentityLocal
