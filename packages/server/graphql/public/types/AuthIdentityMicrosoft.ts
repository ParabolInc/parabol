import type {AuthIdentityMicrosoftResolvers} from '../resolverTypes'

const AuthIdentityMicrosoft: AuthIdentityMicrosoftResolvers = {
  __isTypeOf: ({type}) => type === 'MICROSOFT'
}

export default AuthIdentityMicrosoft
