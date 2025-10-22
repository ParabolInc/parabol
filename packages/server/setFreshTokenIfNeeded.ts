import {isEqualWhenSerialized} from '../client/shared/isEqualWhenSerialized'
import {Threshold} from '../client/types/constEnums'
import AuthToken from './database/types/AuthToken'
import encodeAuthToken from './utils/encodeAuthToken'
import {fromEpochSeconds} from './utils/epochTime'

export const setFreshTokenIfNeeded = (extra: {authToken: AuthToken}, tmsDB: string[]) => {
  const {authToken} = extra
  const {exp, tms} = authToken
  const tokenExpiration = fromEpochSeconds(exp)
  const timeLeftOnToken = tokenExpiration.getTime() - Date.now()
  const tmsIsValid = isEqualWhenSerialized(tmsDB, tms)
  if (timeLeftOnToken < Threshold.REFRESH_JWT_AFTER || !tmsIsValid) {
    const nextAuthToken = new AuthToken({...authToken, tms: tmsDB})
    extra.authToken = nextAuthToken
    return encodeAuthToken(nextAuthToken)
  }
  return null
}
