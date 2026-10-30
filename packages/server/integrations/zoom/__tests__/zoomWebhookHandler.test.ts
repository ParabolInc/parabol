jest.mock('../../../postgres/getKysely', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../utils/getReqAuth', () => ({__esModule: true, default: () => null}))
jest.mock('../../gmeet/attachTranscriptToSummaryPage', () => ({
  attachTranscriptToSummaryPage: jest.fn()
}))
jest.mock('../../matchExternalMeetingToMeeting', () => ({matchExternalMeetingToMeeting: jest.fn()}))
jest.mock('../fetchZoomTranscript', () => ({fetchZoomTranscript: jest.fn()}))

import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {createHmac} from 'crypto'
import zoomWebhookHandler from '../zoomWebhookHandler'

const SECRET = 'zoom-webhook-test-secret'
const urlValidation = JSON.stringify({
  event: 'endpoint.url_validation',
  payload: {plainToken: 'caller-chosen-token'}
})

const hmac = (message: string) => createHmac('sha256', SECRET).update(message).digest('hex')
const sign = (body: string, timestamp: string) => `v0=${hmac(`v0:${timestamp}:${body}`)}`
const secondsAgo = (seconds: number) => String(Math.floor(Date.now() / 1000) - seconds)

const send = async (headers: Record<string, string>, chunks: string[]) => {
  const reply = {status: '', body: ''}
  const res = {
    onAborted: () => res,
    onData: (handler: (chunk: ArrayBuffer, isLast: boolean) => void) => {
      chunks.forEach((chunk, idx) => {
        handler(new Uint8Array(Buffer.from(chunk)).buffer, idx === chunks.length - 1)
      })
      return res
    },
    cork: (thunk: () => unknown) => thunk(),
    writeStatus: (status: string) => {
      reply.status = status
      return res
    },
    writeHeader: () => res,
    end: (body?: string) => {
      reply.body = body ?? ''
      return res
    }
  }
  const req = {getHeader: (name: string) => headers[name] ?? ''}
  await zoomWebhookHandler(res as unknown as HttpResponse, req as unknown as HttpRequest)
  return reply
}

const signedHeaders = (body: string, timestamp = secondsAgo(0)) => ({
  'x-zm-request-timestamp': timestamp,
  'x-zm-signature': sign(body, timestamp)
})

describe('zoomWebhookHandler', () => {
  beforeAll(() => {
    process.env.ZOOM_WEBHOOK_SECRET_TOKEN = SECRET
  })

  afterAll(() => {
    delete process.env.ZOOM_WEBHOOK_SECRET_TOKEN
  })

  it('rejects an unsigned url_validation request without answering the challenge', async () => {
    const reply = await send({}, [urlValidation])
    expect(reply).toEqual({status: '401', body: ''})
  })

  it('rejects a url_validation request whose body does not match its signature', async () => {
    const tampered = urlValidation.replace('caller-chosen-token', 'another-token')
    const reply = await send(signedHeaders(urlValidation), [tampered])
    expect(reply).toEqual({status: '401', body: ''})
  })

  it('rejects a correctly signed request with a stale timestamp', async () => {
    const reply = await send(signedHeaders(urlValidation, secondsAgo(6 * 60)), [urlValidation])
    expect(reply).toEqual({status: '401', body: ''})
  })

  it('rejects a correctly signed request with a timestamp in the future', async () => {
    const reply = await send(signedHeaders(urlValidation, secondsAgo(-6 * 60)), [urlValidation])
    expect(reply).toEqual({status: '401', body: ''})
  })

  it('answers a correctly signed url_validation request', async () => {
    const reply = await send(signedHeaders(urlValidation, secondsAgo(30)), [urlValidation])
    expect(reply.status).toBe('200 OK')
    expect(JSON.parse(reply.body)).toEqual({
      plainToken: 'caller-chosen-token',
      encryptedToken: hmac('caller-chosen-token')
    })
  })

  it('refuses a correctly signed body over the size cap', async () => {
    const oversized = JSON.stringify({
      event: 'endpoint.url_validation',
      payload: {plainToken: 'caller-chosen-token'},
      padding: 'x'.repeat(1_100_000)
    })
    const chunks = [oversized.slice(0, 600_000), oversized.slice(600_000)]
    const reply = await send(signedHeaders(oversized), chunks)
    expect(reply).toEqual({status: '400', body: ''})
  })
})
