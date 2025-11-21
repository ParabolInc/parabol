import AuthToken from '../../../database/types/AuthToken'
import {encodeUnsignedAuthToken} from '../../../utils/encodeAuthToken'
import type {AuthTokenPayloadResolvers} from '../resolverTypes'

export type AuthTokenPayloadSource = {
  tms: string[]
}

const AuthTokenPayload: AuthTokenPayloadResolvers = {
  id: ({tms}, _args, {authToken}) => {
    return encodeUnsignedAuthToken(new AuthToken({...authToken, tms}))
  }
}

export default AuthTokenPayload
