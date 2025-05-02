import fs from 'fs'
import {HttpResponse} from 'uWebSockets.js'

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
    .on('data', (chunk: string | Buffer) => {
      if (res.aborted) {
        readStream.destroy()
        return
      }
      const ab =
        typeof chunk === 'string'
          ? chunk
          : chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)
      res.cork(() => {
        const lastOffset = res.getWriteOffset()
        const [ok, done] = res.tryEnd(ab as ArrayBuffer, totalSize)
        if (done) readStream.destroy()
        if (ok) return
        // backpressure found!
        readStream.pause()
        // save the current chunk & its offset
        res.ab = ab
        res.abOffset = lastOffset

        // set up a drainage
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
    })

    .on('error', () => {
      if (!res.aborted) {
        res.cork(() => {
          res.writeStatus('500').end()
        })
      }
      readStream.destroy()
    })
}

export default pipeStreamOverResponse
