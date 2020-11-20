import {APP_MAX_AVATAR_FILE_SIZE} from 'parabol-client/utils/constants'
import {HttpResponse, getParts, MultipartField} from 'uWebSockets.js'

interface Uploadable {
  contentType: string
  buffer: Buffer
}

type ParseFormBodySignature = {
  res: HttpResponse
  contentType: string
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
  const resBuffer = await parseRes(res)
  if (!resBuffer) return null
  const parts = getParts(resBuffer, contentType) as MultipartField[]
  if (!parts) return null

  try {
    let parsedBody
    parts.forEach(({name, data, type}) => {
      if (name === 'body') {
        parsedBody = JSON.parse(Buffer.from(data).toString())
        return
      }
      if (!name.startsWith('uploadables')) return
      const [, key] = name.split('.')
      parsedBody.payload.variables[key] = {
        contentType: type,
        buffer: Buffer.from(data)
      } as Uploadable
    })
    return parsedBody
  } catch (e) {
    return null
  }
}

export default parseFormBody
