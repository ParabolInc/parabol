import {ServerResponse} from 'http'

type event = 'ka' | 'close' | 'id'

const sendSSEMessage = (res: ServerResponse, rawData: string, event?: event) => {
  if (res.finished) return
  if (event) {
    res.write(`event: ${event}\n`)
  }
  res.write(`data: ${rawData}\n\n`)
  res.flushHeaders()
}

export default sendSSEMessage
