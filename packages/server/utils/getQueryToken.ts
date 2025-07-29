import type {HttpRequest} from 'uWebSockets.js'
import qs from 'querystring'
import getVerifiedAuthToken from './getVerifiedAuthToken'

const getQueryToken = (req: HttpRequest, ignoreExp?: boolean) => {
  const query = req.getQuery()
  const {token} = qs.parse(query)
  return getVerifiedAuthToken(token as string, ignoreExp)
}

export default getQueryToken
