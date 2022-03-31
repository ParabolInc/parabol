import {LoginWithGooglePayloadResolvers} from '../resolverTypes'

export type LoginWithGooglePayloadSource =
  | {
      userId: string
      authToken: string
    }
  | {error: {message: string}}

const LoginWithGooglePayload: LoginWithGooglePayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default LoginWithGooglePayload
