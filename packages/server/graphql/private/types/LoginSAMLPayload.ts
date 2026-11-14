import type {LoginSamlPayloadResolvers} from '../resolverTypes'

export type LoginSAMLPayloadSource = {
  userId: string
  isNewUser: boolean
}

const LoginSAMLPayload: LoginSamlPayloadResolvers = {
  user: ({userId}, _args, {dataLoader}) => dataLoader.get('users').loadNonNull(userId)
}

export default LoginSAMLPayload
