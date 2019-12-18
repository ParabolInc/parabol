import {HttpResponse} from 'uWebSockets.js'

const resDataToBuffer = (res: HttpResponse, onSuccess: (buffer: Buffer) => void) => {
  let buffer: Buffer
  res.onData((ab, isLast) => {
    const curBuf = Buffer.from(ab)
    if (curBuf.byteLength === 0) {
      if (isLast) {
        res.writeStatus('400 Bad Request')
        res.end()
      }
      return
    }
    buffer = buffer ? Buffer.concat([buffer, curBuf]) : curBuf
    if (isLast) {
      onSuccess(buffer)
    }
  })
}

export default resDataToBuffer
