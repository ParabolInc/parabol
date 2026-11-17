import type {HttpResponse} from 'uWebSockets.js'
import {getLogContext} from './utils/requestLogContext'

type Json = null | boolean | number | string | Json[] | {[key: string]: Json}
const defaultParser = <T>(buffer: Buffer): T => JSON.parse(buffer.toString())

const parseBody = <T = Json>({
  res,
  parser = defaultParser,
  maxBytes = Infinity
}: {
  res: HttpResponse
  parser?: (buffer: Buffer) => T
  maxBytes?: number
}) => {
  // uWS calls onData outside the request's async context, so the context is caught here
  const httpLogContext = getLogContext()?.http
  return new Promise<T | null>((resolve) => {
    let buffer: Buffer
    let isTooLarge = false
    res.onData((ab, isLast) => {
      if (!isTooLarge) {
        const curBuf = Buffer.from(ab)
        buffer = buffer
          ? Buffer.concat([buffer, curBuf])
          : isLast
            ? curBuf
            : Buffer.concat([curBuf])
        isTooLarge = buffer.length > maxBytes
      }
      if (isLast) {
        if (isTooLarge) {
          resolve(null)
          return
        }
        if (httpLogContext) {
          // a single chunk is a view of memory uWS frees when this callback returns
          httpLogContext.body = Buffer.from(buffer)
        }
        try {
          resolve(parser(buffer))
        } catch {
          resolve(null)
        }
      }
    })
  })
}

export default parseBody
