import uwsGetHeaders from './uwsGetHeaders'
import getReqAuth from './getReqAuth'
import uwsGetIP from './uwsGetIP'
import {HttpResponse, HttpRequest} from 'uWebSockets.js'

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
