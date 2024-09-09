import {HttpRequest} from 'uWebSockets.js'

const uwsGetHeaders = (req: HttpRequest) => {
  const reqHeaders: Record<string, string> = {}
  req.forEach((key, value) => {
    reqHeaders[key] = value
  })
  return reqHeaders
}
export default uwsGetHeaders
