import {verify} from 'jsonwebtoken'
import type AuthToken from '../database/types/AuthToken'
import logError from './logError'

const SERVER_SECRET_BUFFER = Buffer.from(process.env.SERVER_SECRET!, 'base64')

const getVerifiedAuthToken = (
  jwt: string | undefined | null,
  logErrors = true
): AuthToken | null => {
  if (!jwt) {
    return null
  }
  try {
    return verify(jwt, SERVER_SECRET_BUFFER, {
      clockTolerance: 10
    }) as AuthToken
  } catch (e) {
    if (logErrors) {
      const error = e instanceof Error ? e : new Error('Verify auth token failed')
      logError(error, {tags: {jwt}})
    }
    return null
  }
}

export default getVerifiedAuthToken
