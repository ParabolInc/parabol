import type {HttpResponse} from 'uWebSockets.js'

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
  return new Promise<T | null>((resolve) => {
    let buffer: Buffer
    let byteLength = 0
    res.onData((ab, isLast) => {
      byteLength += ab.byteLength
      if (byteLength > maxBytes) {
        resolve(null)
        return
      }
      const curBuf = Buffer.from(ab)
      buffer = buffer
        ? Buffer.concat([buffer as any, curBuf])
        : isLast
          ? curBuf
          : Buffer.concat([curBuf as any])
      if (isLast) {
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
