jest.mock('../../../postgres/getKysely', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../utils/getReqAuth', () => ({__esModule: true, default: () => null}))
jest.mock('../../gmeet/attachTranscriptToSummaryPage', () => ({
  attachTranscriptToSummaryPage: jest.fn()
}))
jest.mock('../../matchExternalMeetingToMeeting', () => ({
  ...jest.requireActual('../../matchExternalMeetingToMeeting'),
  matchExternalMeetingToMeeting: jest.fn()
}))
jest.mock('@whatwg-node/fetch', () => ({fetch: jest.fn()}))
jest.mock('../../../utils/getRedis', () => {
  const pipeline = {
    hset: (key: string, field: string, value: string) => {
      mockRedisHash(key).set(field, value)
      return pipeline
    },
    pexpire: () => pipeline,
    exec: async () => []
  }
  const redis = {
    multi: () => pipeline,
    hdel: async (key: string, field: string) => Number(mockRedisHash(key).delete(field)),
    hvals: async (key: string) => [...mockRedisHash(key).values()]
  }
  return {__esModule: true, default: () => redis}
})

import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {fetch} from '@whatwg-node/fetch'
import {createHmac} from 'crypto'
import getKysely from '../../../postgres/getKysely'
import {attachTranscriptToSummaryPage} from '../../gmeet/attachTranscriptToSummaryPage'
import {matchExternalMeetingToMeeting} from '../../matchExternalMeetingToMeeting'
import zoomWebhookHandler, {attachHeldZoomEvents} from '../zoomWebhookHandler'

const mockRedisHashes = new Map<string, Map<string, string>>()
const mockRedisHash = (key: string) => {
  const hash = mockRedisHashes.get(key) ?? new Map<string, string>()
  mockRedisHashes.set(key, hash)
  return hash
}

const mockedGetKysely = getKysely as jest.MockedFunction<typeof getKysely>
const mockedMatch = matchExternalMeetingToMeeting as jest.MockedFunction<
  typeof matchExternalMeetingToMeeting
>

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

const summaryCompleted = (meetingEndTime: Date) =>
  JSON.stringify({
    event: 'meeting.summary_completed',
    payload: {
      object: {
        meeting_host_id: 'zoom-host-id',
        meeting_uuid: 'zoom-meeting-uuid',
        meeting_end_time: meetingEndTime.toISOString(),
        summary_overview: 'We agreed to ship on Friday.'
      }
    }
  })

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000)

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

  describe('a call reported before its Parabol meeting ends', () => {
    const hostZoomAuths = [{userId: 'local|host', teamId: 'team-id'}]
    const teamZoomHosts = [{providerUserId: 'zoom-host-id'}]
    const pg = {
      selectFrom: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      $narrowType: jest.fn().mockReturnThis(),
      insertInto: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      onConflict: jest.fn().mockReturnThis(),
      execute: jest.fn(),
      executeTakeFirst: jest.fn()
    }

    const reportCall = async (meetingEndTime: Date) => {
      pg.execute.mockResolvedValueOnce(hostZoomAuths)
      mockedMatch.mockResolvedValueOnce(null)
      const body = summaryCompleted(meetingEndTime)
      await send(signedHeaders(body), [body])
      await waitForDispatch()
    }

    beforeAll(() => {
      mockedGetKysely.mockReturnValue(pg as unknown as ReturnType<typeof getKysely>)
      jest.spyOn(console, 'info').mockImplementation(() => {})
    })

    afterEach(() => {
      mockRedisHashes.clear()
    })

    afterAll(() => {
      jest.restoreAllMocks()
    })

    it('attaches the summary once a meeting of the host ends', async () => {
      await reportCall(minutesAgo(1))
      expect(attachTranscriptToSummaryPage).not.toHaveBeenCalled()

      pg.execute.mockResolvedValueOnce(teamZoomHosts).mockResolvedValueOnce(hostZoomAuths)
      mockedMatch.mockResolvedValueOnce({
        teamId: 'team-id',
        name: 'Sprint Retro',
        summaryPageId: 7,
        userId: 'local|host'
      })
      pg.executeTakeFirst.mockResolvedValueOnce({numInsertedOrUpdatedRows: 1n})
      await attachHeldZoomEvents('team-id')
      expect(attachTranscriptToSummaryPage).toHaveBeenCalledWith(
        7,
        [{title: 'Zoom Summary for Sprint Retro', content: expect.anything()}],
        'local|host',
        'zoom:summary:zoom-meeting-uuid'
      )

      pg.execute.mockResolvedValueOnce(teamZoomHosts)
      await attachHeldZoomEvents('team-id')
      expect(mockedMatch).toHaveBeenCalledTimes(2)
      expect(attachTranscriptToSummaryPage).toHaveBeenCalledTimes(1)
    })

    it('lets the call go once no meeting could end near it', async () => {
      await reportCall(minutesAgo(1))
      const dateNow = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 30 * 60 * 1000)
      pg.execute.mockResolvedValueOnce(teamZoomHosts).mockResolvedValueOnce(hostZoomAuths)
      mockedMatch.mockResolvedValueOnce(null)
      await attachHeldZoomEvents('team-id')
      dateNow.mockRestore()

      pg.execute.mockResolvedValueOnce(teamZoomHosts)
      await attachHeldZoomEvents('team-id')
      expect(mockedMatch).toHaveBeenCalledTimes(2)
      expect(attachTranscriptToSummaryPage).not.toHaveBeenCalled()
    })

    it('does not hold a call reported after its window closed', async () => {
      await reportCall(minutesAgo(31))
      pg.execute.mockResolvedValueOnce(teamZoomHosts)
      await attachHeldZoomEvents('team-id')
      expect(mockedMatch).toHaveBeenCalledTimes(1)
    })
  })
})
