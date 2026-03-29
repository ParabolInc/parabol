import AuthToken from '../../../database/types/AuthToken'
import {encodeUnsignedAuthToken} from '../../../utils/encodeAuthToken'
import type {AuthTokenPayloadResolvers} from '../resolverTypes'

export type AuthTokenPayloadSource = {
  tms?: string[]
}

// This resolver is effectively dead code — nothing publishes AuthTokenPayload anymore.
// Kept for schema compatibility until AuthTokenPayload is removed from the SDL.
const AuthTokenPayload: AuthTokenPayloadResolvers = {
  id: (_source, _args, {authToken}) => {
    return encodeUnsignedAuthToken(new AuthToken({...authToken}))
  }
}

export default AuthTokenPayload
