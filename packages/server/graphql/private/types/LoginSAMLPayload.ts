import type {LoginSamlPayloadResolvers} from '../resolverTypes'

export type LoginSAMLPayloadSource =
  | {
      userId: string
      isNewUser: boolean
    }
  | {error: {message: string}}

const LoginSAMLPayload: LoginSamlPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default LoginSAMLPayload
