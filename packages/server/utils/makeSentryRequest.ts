import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import getReqAuth from './getReqAuth'
import uwsGetHeaders from './uwsGetHeaders'
import uwsGetIP from './uwsGetIP'

const makeSentryRequest = (res: HttpResponse, req: HttpRequest) => {
  return {
    ip: uwsGetIP(res, req),
    method: req.getMethod().toUpperCase(),
    url: req.getUrl(),
    header: uwsGetHeaders(req),
    protocol: 'https',
    query_string: req.getQuery(),
    user: {id: getReqAuth(req).sub}
  }
}

export default makeSentryRequest
