import {verify} from 'jsonwebtoken'
import AuthToken from '../database/types/AuthToken'

const SERVER_SECRET_BUFFER = Buffer.from(process.env.AUTH0_CLIENT_SECRET!, 'base64')

const getVerifiedAuthToken = (jwt: string | undefined | null): AuthToken | {} => {
  if (!jwt) return {}
  try {
    return verify(jwt, SERVER_SECRET_BUFFER)
  } catch (e) {
    return {}
  }
}

export default getVerifiedAuthToken
