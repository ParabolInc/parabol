import {maskCredentialText} from './maskCredentials'
import normalizeUrlPath from './normalizeUrlPath'

const MAX_BODY_BYTES = 512

export interface ThirdPartyResponse {
  integration: string
  method: string
  endpoint: string
  path: string
  status: number
  contentType: string
  body: string
}

type ReadableResponse = Pick<Response, 'status' | 'headers' | 'body'>

export const normalizeEndpoint = (url: URL) => `${url.host}${normalizeUrlPath(url.pathname)}`

export const readBodyStart = async (res: ReadableResponse, maxBytes = MAX_BODY_BYTES) => {
  const reader = res.body?.getReader()
  if (!reader) return ''
  const decoder = new TextDecoder()
  let text = ''
  let byteCount = 0
  try {
    while (byteCount < maxBytes) {
      const {value, done} = await reader.read()
      if (done) break
      const chunk = value.subarray(0, maxBytes - byteCount)
      byteCount += chunk.byteLength
      text += decoder.decode(chunk, {stream: true})
    }
  } catch {
    // a body that fails mid-read still says something
  } finally {
    reader.cancel().catch(() => {})
  }
  return maskCredentialText(text)
}

// It keeps a plain Error's name, and the caller constructs it after reading the response,
// so the stack's top frame and the fingerprint are the ones a plain Error had there
export class ThirdPartyResponseError extends Error {
  response: ThirdPartyResponse
  constructor(message: string, response: ThirdPartyResponse) {
    super(message)
    this.response = response
  }
}

export const readThirdPartyResponse = async (
  integration: string,
  res: ReadableResponse,
  request: {method?: string; url: string | URL}
): Promise<ThirdPartyResponse> => {
  const url = new URL(request.url)
  return {
    integration,
    method: (request.method ?? 'GET').toUpperCase(),
    endpoint: normalizeEndpoint(url),
    path: url.pathname,
    status: res.status,
    contentType: res.headers.get('content-type') ?? '',
    body: await readBodyStart(res)
  }
}
