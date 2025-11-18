import {sign} from 'jsonwebtoken'
import type AuthToken from '../database/types/AuthToken'

const SERVER_SECRET = process.env.SERVER_SECRET!
const encodeAuthToken = (authToken: AuthToken) => {
  const secret = Buffer.from(SERVER_SECRET, 'base64')
  return sign(JSON.parse(JSON.stringify(authToken)), secret)
}

export const encodeUnsignedAuthToken = (authToken: AuthToken) => {
  const noSecret = ''
  return sign(JSON.parse(JSON.stringify(authToken)), noSecret, {algorithm: 'none'})
}

export default encodeAuthToken
