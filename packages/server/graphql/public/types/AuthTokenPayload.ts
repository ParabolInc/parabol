import AuthToken from '../../../database/types/AuthToken'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import {AuthTokenPayloadResolvers} from '../resolverTypes'

export type AuthTokenPayloadSource = {
  tms: string[]
}

const AuthTokenPayload: AuthTokenPayloadResolvers = {
  id: ({tms}, _args, {authToken}) => {
    return encodeAuthToken(new AuthToken({...authToken, tms}))
  }
}

export default AuthTokenPayload
