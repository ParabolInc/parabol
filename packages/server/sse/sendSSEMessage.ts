import {HttpResponse} from 'uWebSockets.js'

type event = 'ka' | 'close' | 'id'

const sendSSEMessage = (res: HttpResponse, rawData: string, event?: event) => {
  if (res.done) return
  if (event) {
    res.tryEnd(`event: ${event}\n`, 1e8)
  }
  res.tryEnd(`data: ${rawData}\n\n`, 1e8)
}

export default sendSSEMessage
