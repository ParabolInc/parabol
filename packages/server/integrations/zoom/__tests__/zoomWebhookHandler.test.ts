jest.mock('../../../postgres/getKysely', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../utils/getReqAuth', () => ({__esModule: true, default: () => null}))
jest.mock('../../gmeet/attachTranscriptToSummaryPage', () => ({
  attachTranscriptToSummaryPage: jest.fn()
}))
jest.mock('../../matchExternalMeetingToMeeting', () => ({matchExternalMeetingToMeeting: jest.fn()}))
jest.mock('@whatwg-node/fetch', () => ({fetch: jest.fn()}))

import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {fetch} from '@whatwg-node/fetch'
import {createHmac} from 'crypto'
import getKysely from '../../../postgres/getKysely'
import zoomWebhookHandler from '../zoomWebhookHandler'

const mockedGetKysely = getKysely as jest.MockedFunction<typeof getKysely>

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

const transcriptCompleted = (downloadUrl: string) =>
  JSON.stringify({
    event: 'recording.transcript_completed',
    download_token: 'download-token',
    payload: {
      object: {
        uuid: 'zoom-meeting-uuid',
        host_id: 'zoom-host-id',
        recording_files: [
          {
            file_type: 'TRANSCRIPT',
            file_extension: 'VTT',
            status: 'completed',
            download_url: downloadUrl,
            recording_end: new Date().toISOString()
          }
        ]
      }
    }
  })

const waitForDispatch = () => new Promise((resolve) => setImmediate(resolve))

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

  describe('transcript download_url', () => {
    const pg = {
      selectFrom: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue([])
    }

    beforeAll(() => {
      mockedGetKysely.mockReturnValue(pg as unknown as ReturnType<typeof getKysely>)
      jest.spyOn(console, 'warn').mockImplementation(() => {})
      jest.spyOn(console, 'info').mockImplementation(() => {})
    })

    afterAll(() => {
      jest.restoreAllMocks()
    })

    it('refuses a download_url outside zoom.us before claiming the meeting or fetching', async () => {
      const body = transcriptCompleted('https://attacker.example/rec/download/transcript.vtt')
      const reply = await send(signedHeaders(body), [body])
      await waitForDispatch()
      expect(reply.status).toBe('200 OK')
      expect(pg.selectFrom).not.toHaveBeenCalled()
      expect(fetch).not.toHaveBeenCalled()
    })

    it('goes on to claim the meeting for a zoom.us download_url', async () => {
      const body = transcriptCompleted('https://us06web.zoom.us/rec/webhook_download/abc/def')
      const reply = await send(signedHeaders(body), [body])
      await waitForDispatch()
      expect(reply.status).toBe('200 OK')
      expect(pg.selectFrom).toHaveBeenCalledWith('TeamMemberIntegrationAuth')
    })
  })
})
