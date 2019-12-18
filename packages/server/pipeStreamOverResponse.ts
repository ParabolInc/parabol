import {HttpResponse} from 'uWebSockets.js'
import fs from 'fs'

const pipeStreamOverResponse = (
  res: HttpResponse,
  readStream: fs.ReadStream,
  totalSize: number
) => {
  res.onAborted(() => {
    readStream.destroy()
    res.aborted = true
  })
  readStream
    .on('data', (chunk: Buffer) => {
      if (res.aborted) return
      const ab = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)
      const lastOffset = res.getWriteOffset()
      const [ok, done] = res.tryEnd(ab, totalSize)
      if (done) {
        readStream.destroy()
        return
      }
      if (ok) return
      // backpressure handling
      readStream.pause()
      res.ab = ab
      res.abOffset = lastOffset
      res.onWritable((offset) => {
        const [ok, done] = res.tryEnd(res.ab.slice(offset - res.abOffset), totalSize)
        if (done) {
          readStream.destroy()
        } else if (ok) {
          readStream.resume()
        }
        return ok
      })
    })

    .on('error', (e) => {
      if (!res.aborted) {
        res.writeStatus('500 Internal server error')
        res.end()
      }
      readStream.destroy()
      throw e
    })
}

export default pipeStreamOverResponse
