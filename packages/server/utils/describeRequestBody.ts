import {maskCredentials, maskCredentialText} from './maskCredentials'

const MAX_BODY_LENGTH = 16_000
const TEXT_TYPE = /^text\/|json|xml|x-www-form-urlencoded/

const parseRequestBody = (text: string, mediaType: string | undefined) => {
  if (mediaType === 'application/x-www-form-urlencoded') {
    return Object.fromEntries(new URLSearchParams(text))
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

const describeRequestBody = (body: Buffer, contentType: string | undefined) => {
  if (body.length === 0) return undefined
  const mediaType = contentType?.split(';')[0]?.trim().toLowerCase() || undefined
  if (mediaType && !TEXT_TYPE.test(mediaType)) {
    return {body: `[${body.length} bytes of ${mediaType}]`}
  }
  const text = body.toString('utf8')
  const parsedBody = parseRequestBody(text, mediaType)
  const maskedBody =
    parsedBody === undefined ? maskCredentialText(text) : maskCredentials(parsedBody)
  const serializedBody = typeof maskedBody === 'string' ? maskedBody : JSON.stringify(maskedBody)
  if (serializedBody.length <= MAX_BODY_LENGTH) return {body: maskedBody}
  return {body: serializedBody.slice(0, MAX_BODY_LENGTH), bodyLength: serializedBody.length}
}

export default describeRequestBody
