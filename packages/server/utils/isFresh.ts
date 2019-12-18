import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import fresh from 'fresh'

const isFresh = (res: HttpResponse, req: HttpRequest) => {
  return fresh(
    {
      'if-modified-since': req.getHeader('if-modified-since'),
      'if-none-match': req.getHeader('if-none-match'),
      'cache-control': req.getHeader('cache-control')
    },
    {
      etag: res.getHeader('etag'),
      'last-modified': res.getHeader('last-modified')
    }
  )
}

export default isFresh
