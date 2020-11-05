import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import Busboy from 'busboy'
import {Readable} from 'stream'
import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {APP_MAX_AVATAR_FILE_SIZE} from 'parabol-client/utils/constants'

interface FileUpload {
  contentType: string
  buffer: Buffer
}

type ParseFormBodySignature = (res: HttpResponse, req: HttpRequest) => Promise<JSON | null>

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

const mergeFileIntoBody = (file, body) => {
  if (body && file) {
    body.payload.variables = {
      ...body.payload.variables,
      file
    }
  }
  return body
}

const tryToResolve = (file, body, resolve) => {
  if (file && body) {
    mergeFileIntoBody(file, body)
    resolve(body)
  }
}

const parseFormBody: ParseFormBodySignature = (res, req) => {
  // todo: better typing, validation, etc.
  let parsedBody, file
  return new Promise((resolve, reject) => {
    const parser = new Busboy({
      headers: reqHeaders(req),
      limits: {
        fields: 1,
        files: 1,
        fileSize: APP_MAX_AVATAR_FILE_SIZE
      }
    })
    let buffer: Buffer
    parser.on('file', (_0, fileStream, _1, _2, contentType) => {
      fileStream.on('data', (curBuf) => {
        buffer = buffer ? Buffer.concat([buffer, curBuf]) : Buffer.concat([curBuf])
      })
      fileStream.on('end', () => {
        file = {
          buffer,
          contentType
        } as FileUpload
        tryToResolve(file, parsedBody, resolve)
      })
      fileStream.on('limit', () => { reject(new Error('File size too large')) })
    })
    parser.on('field', async (fieldname, val) => {
      console.log('fieldname found!', fieldname)
      if (fieldname !== 'body') return
      parsedBody = (await JSON.parse(val)) as OutgoingMessage
      tryToResolve(file, parsedBody, resolve)
    })
    bodyStream(res).pipe(parser)
  })
}

export default parseFormBody
