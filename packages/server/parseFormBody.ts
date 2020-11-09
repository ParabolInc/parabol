import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import Busboy from 'busboy'
import {Readable} from 'stream'
import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {APP_MAX_AVATAR_FILE_SIZE} from 'parabol-client/utils/constants'

const bodyStream = (res: HttpResponse) => {
  const stream = new Readable()
  stream._read = () => 'no-op'
  res.onData((ab, isLast) => {
    const curBuf = Buffer.from(ab)
    stream.push(new Uint8Array(curBuf.slice(curBuf.byteOffset, curBuf.byteLength)))
    if (isLast) stream.push(null)
  })
  return stream
}

const reqHeaders = (req: HttpRequest) => {
  const headers = {} as {[key: string]: string}
  req.forEach((k, v) => (headers[k] = v))
  return headers
}

const parseFile = (fileStream, contentType) => {
  return new Promise((resolve, reject) => {
    let buffer: Buffer
    fileStream.on('data', (curBuf) => {
      buffer = buffer ? Buffer.concat([buffer, curBuf]) : Buffer.concat([curBuf])
    })
    fileStream.on('end', () => {
      const parsedFile = {
        buffer,
        contentType
      } as {
        contentType: string
        buffer: Buffer
      }
      resolve(parsedFile)
    })
    fileStream.on('limit', () => {
      reject(new Error('File size too large'))
    })
  })
}

const parseFormBody = ({res, req}: {res: HttpResponse; req: HttpRequest}): Promise<JSON | null> => {
  const parser = new Busboy({
    headers: reqHeaders(req),
    limits: {
      fields: 1,
      files: 1,
      fileSize: APP_MAX_AVATAR_FILE_SIZE
    }
  })
  return new Promise((resolve) => {
    let foundMessage, foundFile
    parser.on('field', async (fieldname, value) => {
      if (fieldname !== 'body') return
      foundMessage = JSON.parse(value) as Promise<OutgoingMessage>
    })
    parser.on('file', async (_0, fileStream, _1, _2, contentType) => {
      foundFile = parseFile(fileStream, contentType)
    })
    parser.on('finish', async () => {
      try {
        const [parsedMessage, parsedFile] = await Promise.all([foundMessage, foundFile])
        parsedMessage.payload.variables = {
          ...parsedMessage.payload.variables,
          file: parsedFile
        }
        resolve(parsedMessage)
      } catch (e) {
        resolve(null)
      }
    })
    bodyStream(res).pipe(parser)
  })
}

export default parseFormBody
