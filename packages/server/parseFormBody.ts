import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import Busboy from 'busboy'
import {Readable} from 'stream'
import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {ResolvedFile} from './graphql/types/GraphQLFileType'

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
  return new Promise((resolve) => {
    const busboy = new Busboy({
      headers: reqHeaders(req)
    })
    let buffer
    busboy.on('file', (_0, fileStream, _1, _2, mimeType) => {
      fileStream.on('data', (curBuf) => {
        buffer = buffer ? Buffer.concat([buffer, curBuf]) : Buffer.concat([curBuf])
      })
      fileStream.on('end', () => {
        file = {fileBuffer: buffer, contentType: mimeType} as ResolvedFile
        tryToResolve(file, parsedBody, resolve)
      })
    })
    busboy.on('field', async (fieldname, val) => {
      if (fieldname !== 'body') return
      parsedBody = (await JSON.parse(val)) as OutgoingMessage
      tryToResolve(file, parsedBody, resolve)
    })
    bodyStream(res).pipe(busboy)
  })
}

export default parseFormBody
