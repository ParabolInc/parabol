import AuthToken from '../../../database/types/AuthToken'
import {encodeUnsignedAuthToken} from '../../../utils/encodeAuthToken'
import type {AuthTokenPayloadResolvers} from '../resolverTypes'

export type AuthTokenPayloadSource = {
  tms: string[]
}

const AuthTokenPayload: AuthTokenPayloadResolvers = {
  id: ({tms}, _args, {authToken}) => {
    // Omit jti so a fresh one is generated. The WS handler (wsHandler.onNext) sets
    // extra.authToken to the decoded token, and refreshSession then blacklists the
    // cookie's jti. If we carried jti over, both would be the same value and the WS
    // would hold a blacklisted token.
    const {jti: _jti, ...rest} = authToken!
    return encodeUnsignedAuthToken(new AuthToken({...rest, tms}))
  }
}

export default AuthTokenPayload
