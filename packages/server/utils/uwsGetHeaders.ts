import {HttpRequest} from 'uWebSockets.js'

const uwsGetHeaders = (req: HttpRequest) => {
  const reqHeaders = {}
  req.forEach((key, value) => {
    reqHeaders[key] = value
  })
  return reqHeaders
}
export default uwsGetHeaders
