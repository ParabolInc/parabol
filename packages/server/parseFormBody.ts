import {APP_MAX_AVATAR_FILE_SIZE} from 'parabol-client/utils/constants'
import {HttpResponse, getParts, MultipartField} from 'uWebSockets.js'
import {OperationPayload} from '@mattkrick/graphql-trebuchet-client'

interface UploadableBuffer {
  contentType: string
  buffer: Buffer
}

interface UploadableBufferMap {
  [key: string]: UploadableBuffer
}

type ParseFormBodySignature = {
  res: HttpResponse
  contentType: string
}

interface FetchHTTPData {
  type: 'start' | 'stop'
  payload: OperationPayload
}

const parseRes = (res: HttpResponse) => {
  return new Promise<Buffer | null>((resolve) => {
    let buffer: Buffer
    res.onData((ab, isLast) => {
      const curBuf = Buffer.from(ab)
      buffer = buffer ? Buffer.concat([buffer, curBuf]) : isLast ? curBuf : Buffer.concat([curBuf])
      if (buffer.length > APP_MAX_AVATAR_FILE_SIZE) resolve(null)
      if (isLast) resolve(buffer)
    })
  })
}

const parseFormBody = async ({res, contentType}: ParseFormBodySignature): Promise<JSON | null> => {
  let parsedBody: unknown
  const parsedUploadables: UploadableBufferMap = {}
  const resBuffer = await parseRes(res)
  if (!resBuffer) return null
  const parts = getParts(resBuffer, contentType) as MultipartField[]
  if (!parts) return null

  try {
    parts.forEach(({name, data, type}) => {
      if (name === 'body') {
        parsedBody = JSON.parse(Buffer.from(data).toString())
      } else if (name.startsWith('uploadables')) {
        const [, key] = name.split('.')
        parsedUploadables[key] = {
          contentType: type,
          buffer: Buffer.from(data)
        } as UploadableBuffer
      }
    })
    if (!parsedBody || typeof parsedBody !== 'object') return null
    if (Object.keys(parsedUploadables).length) {
      const validParsedBody = parsedBody as FetchHTTPData
      validParsedBody.payload.variables = {
        ...validParsedBody.payload.variables,
        ...parsedUploadables
      }
    }
    return parsedBody as JSON
  } catch (e) {
    return null
  }
}

export default parseFormBody
