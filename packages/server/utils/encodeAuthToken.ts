import {sign} from 'jsonwebtoken'
import AuthToken from '../database/types/AuthToken'

const encodeAuthToken = (authToken: AuthToken) => {
  const secret = Buffer.from(process.env.AUTH0_CLIENT_SECRET as string, 'base64')
  return sign(JSON.parse(JSON.stringify(authToken)), secret)
}

export default encodeAuthToken
