import {HttpResponse} from 'uWebSockets.js'

const defaultParser = (buffer: Buffer) => JSON.parse(buffer.toString())

const parseBody = ({
  res,
  parser = defaultParser
}: {
  res: HttpResponse
  parser?: (buffer: Buffer) => any
}) => {
  return new Promise<JSON | null>((resolve) => {
    let buffer: Buffer
    res.onData((ab, isLast) => {
      const curBuf = Buffer.from(ab)
      buffer = buffer ? Buffer.concat([buffer, curBuf]) : isLast ? curBuf : Buffer.concat([curBuf])
      if (isLast) {
        try {
          resolve(parser(buffer))
        } catch (e) {
          resolve(null)
        }
      }
    })
  })
}

export default parseBody
