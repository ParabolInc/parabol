import {Threshold} from '../client/types/constEnums'
import AuthToken from './database/types/AuthToken'
import {fromEpochSeconds} from './utils/epochTime'

export const getFreshTokenIfNeeded = (authToken: AuthToken) => {
  const {exp} = authToken
  const tokenExpiration = fromEpochSeconds(exp)
  const timeLeftOnToken = tokenExpiration.getTime() - Date.now()
  if (timeLeftOnToken < Threshold.REFRESH_JWT_AFTER) {
    const nextAuthToken = new AuthToken({...authToken})
    return nextAuthToken
  }
  return null
}
