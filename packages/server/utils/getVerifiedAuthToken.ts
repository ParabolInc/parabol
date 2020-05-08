import {verify} from 'jsonwebtoken'
import AuthToken from '../database/types/AuthToken'

const SERVER_SECRET_BUFFER = Buffer.from(process.env.SERVER_SECRET!, 'base64')

const getVerifiedAuthToken = (jwt: string | undefined | null, ignoreExp?: boolean) => {
  if (!jwt) return {} as AuthToken
  try {
    return verify(jwt, SERVER_SECRET_BUFFER, {ignoreExpiration: ignoreExp}) as AuthToken
  } catch (e) {
    return {} as AuthToken
  }
}

export default getVerifiedAuthToken
