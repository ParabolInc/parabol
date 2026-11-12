import {verify} from 'jsonwebtoken'
import type AuthToken from '../database/types/AuthToken'
import logError from './logError'

const SERVER_SECRET_BUFFER = Buffer.from(process.env.SERVER_SECRET!, 'base64')

const getVerifiedAuthToken = (
  jwt: string | undefined | null,
  logErrors = true,
  audience = 'action'
): AuthToken | null => {
  if (!jwt) {
    return null
  }
  try {
    const authToken = verify(jwt, SERVER_SECRET_BUFFER, {
      algorithms: ['HS256'],
      clockTolerance: 10
    }) as AuthToken
    return authToken.aud === audience ? authToken : null
  } catch (e) {
    if (logErrors) {
      const error = e instanceof Error ? e : new Error('Verify auth token failed')
      logError(error, {tags: {jwt}})
    }
    return null
  }
}

export default getVerifiedAuthToken
