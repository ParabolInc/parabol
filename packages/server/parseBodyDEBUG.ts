import {HttpResponse} from 'uWebSockets.js'

const parseBody = (res: HttpResponse) => {
  return new Promise<Buffer>((resolve) => {
    let buffer: Buffer
    res.onData((ab, isLast) => {
      const curBuf = Buffer.from(ab)
      // if resovler is inside setImmediate we'll need to
      buffer = buffer ? Buffer.concat([buffer, curBuf]) : Buffer.concat([curBuf])
      if (isLast) {
        setImmediate(() => {
          resolve(buffer)
        })
      }
    })
  })
}

export default parseBody
