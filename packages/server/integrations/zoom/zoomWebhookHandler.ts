import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {Editor} from '@tiptap/core'
import {createHmac, timingSafeEqual} from 'crypto'
import ms from 'ms'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'
import {attachTranscriptToSummaryPage} from '../gmeet/attachTranscriptToSummaryPage'
import {matchExternalMeetingToMeeting} from '../matchExternalMeetingToMeeting'
import {fetchZoomTranscript} from './fetchZoomTranscript'
import {processZoomTranscript} from './processZoomTranscript'

const MAX_WEBHOOK_BODY_BYTES = 1_000_000
const MAX_TIMESTAMP_AGE = ms('5m')

type ZoomRecordingFile = {
  id: string
  file_type: string
  file_extension: string
  download_url: string
  recording_end: string
  status: string
}

type ZoomRecordingCompletedPayload = {
  event: 'recording.transcript_completed'
  payload: {
    object: {
      uuid: string
      host_id: string
      topic: string
      start_time: string
      duration: number
      recording_files: ZoomRecordingFile[]
    }
  }
  download_token: string
}

type ZoomSummaryCompletedPayload = {
  event: 'meeting.summary_completed'
  payload: {
    object: {
      meeting_host_id: string
      meeting_uuid: string
      meeting_topic: string
      meeting_start_time: string
      meeting_end_time: string
      summary_title: string
      summary_content?: string
      summary_overview?: string
      summary_details?: {label: string; summary: string}[]
      next_steps?: string[]
    }
  }
}

type ZoomUrlValidationPayload = {
  event: 'endpoint.url_validation'
  payload: {plainToken: string}
}

type ZoomWebhookPayload =
  | ZoomRecordingCompletedPayload
  | ZoomSummaryCompletedPayload
  | ZoomUrlValidationPayload

const verifyZoomSignature = (
  secret: string,
  timestamp: string,
  rawBody: string,
  signature: string
): boolean => {
  const message = `v0:${timestamp}:${rawBody}`
  const expected = `v0=${createHmac('sha256', secret).update(message).digest('hex')}`
  const expectedBuf = Buffer.from(expected)
  const actualBuf = Buffer.from(signature)
  return expectedBuf.length === actualBuf.length && timingSafeEqual(expectedBuf, actualBuf)
}

const isFreshTimestamp = (timestamp: string) => {
  const sentAt = Number(timestamp) * 1000
  return Number.isFinite(sentAt) && Math.abs(Date.now() - sentAt) <= MAX_TIMESTAMP_AGE
}

const zoomWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN

  if (!secret) {
    res.writeStatus('500').end()
    return
  }

  const timestamp = req.getHeader('x-zm-request-timestamp')
  const signature = req.getHeader('x-zm-signature')

  const rawBody = await parseBody<string>({
    res,
    parser: (buf) => buf.toString(),
    maxBytes: MAX_WEBHOOK_BODY_BYTES
  })
  if (!rawBody) {
    res.writeStatus('400').end()
    return
  }

  // The url_validation reply is an HMAC of a caller-chosen token under the signing key, so answering
  // it unsigned would hand out signatures for arbitrary bodies
  if (!isFreshTimestamp(timestamp) || !verifyZoomSignature(secret, timestamp, rawBody, signature)) {
    res.writeStatus('401').end()
    return
  }

  let payload: ZoomWebhookPayload
  try {
    payload = JSON.parse(rawBody) as ZoomWebhookPayload
  } catch {
    res.writeStatus('400').end()
    return
  }
  if (payload.event === 'endpoint.url_validation') {
    const {plainToken} = payload.payload
    const encryptedToken = createHmac('sha256', secret).update(plainToken).digest('hex')
    res
      .writeStatus('200 OK')
      .writeHeader('Content-Type', 'application/json')
      .end(JSON.stringify({plainToken, encryptedToken}))
    return
  }

  res.writeStatus('200 OK').end()
  dispatchZoomEvent(payload).catch(Logger.log)
})

const dispatchZoomEvent = async (payload: ZoomWebhookPayload) => {
  if (payload.event === 'recording.transcript_completed') {
    await processTranscriptCompleted(payload)
  } else if (payload.event === 'meeting.summary_completed') {
    await processSummaryCompleted(payload)
  }
}

const claimHostMeeting = async (hostId: string, meetingEndedAt: Date, externalId: string) => {
  const pg = getKysely()
  const hostAuths = await pg
    .selectFrom('TeamMemberIntegrationAuth')
    .select(['userId', 'teamId'])
    .where('providerUserId', '=', hostId)
    .where('service', '=', 'zoom')
    .where('isActive', '=', true)
    .execute()
  if (hostAuths.length === 0) {
    Logger.log(`${externalId}: host ${hostId} has no active Zoom auth`)
    return null
  }
  const meeting = await matchExternalMeetingToMeeting(meetingEndedAt, hostAuths)
  if (!meeting) {
    Logger.log(
      `${externalId}: no meeting of host ${hostId} ended near ${meetingEndedAt.toISOString()}`
    )
    return null
  }
  const insertResult = await pg
    .insertInto('ExternalMeetingFile')
    .values({id: externalId, teamId: meeting.teamId})
    .onConflict((oc) => oc.column('id').doNothing())
    .executeTakeFirst()
  if (insertResult.numInsertedOrUpdatedRows === 0n) return null
  return meeting
}

const releaseClaimOnFailure = async (externalId: string, attach: () => Promise<void>) => {
  try {
    await attach()
  } catch (e) {
    await getKysely().deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
    throw e
  }
}

const processTranscriptCompleted = async (payload: ZoomRecordingCompletedPayload) => {
  const {download_token} = payload
  const {uuid, host_id, recording_files} = payload.payload.object
  const transcriptFile = recording_files.find(
    (f) => f.file_type === 'TRANSCRIPT' && f.file_extension === 'VTT' && f.status === 'completed'
  )
  if (!transcriptFile) return

  const externalId = `zoom:transcript:${uuid}`
  // the payload's duration is the scheduled length, so only the recording knows when the call ended
  const endedAt = new Date(transcriptFile.recording_end)
  const meeting = await claimHostMeeting(host_id, endedAt, externalId)
  if (!meeting) return

  await releaseClaimOnFailure(externalId, async () => {
    const vtt = await fetchZoomTranscript(transcriptFile.download_url, download_token)
    if (!vtt) throw new Error(`${externalId}: transcript download failed`)
    const pageContent = processZoomTranscript(vtt)
    if (!pageContent) throw new Error(`${externalId}: transcript has no cues`)
    await attachTranscriptToSummaryPage(
      meeting.summaryPageId,
      [{title: `Zoom Transcript for ${meeting.name}`, content: pageContent}],
      meeting.userId,
      externalId
    )
  })
}

const toSummaryMarkdown = (zoomSummary: ZoomSummaryCompletedPayload['payload']['object']) => {
  const {summary_content, summary_overview, summary_details = [], next_steps = []} = zoomSummary
  if (summary_content?.trim()) return summary_content.trim()
  // summary_content is optional, so fall back to the deprecated fields Zoom still sends
  const sections = [
    summary_overview,
    ...summary_details.map(({label, summary}) => `## ${label}\n\n${summary}`),
    next_steps.length > 0
      ? `## Next steps\n\n${next_steps.map((step) => `- ${step}`).join('\n')}`
      : undefined
  ]
  return sections.filter(Boolean).join('\n\n').trim()
}

const processSummaryCompleted = async (payload: ZoomSummaryCompletedPayload) => {
  const summary = payload.payload.object
  const externalId = `zoom:summary:${summary.meeting_uuid}`
  const markdown = toSummaryMarkdown(summary)
  if (!markdown) {
    Logger.log(`${externalId}: summary has no content`)
    return
  }

  const endedAt = new Date(summary.meeting_end_time)
  const meeting = await claimHostMeeting(summary.meeting_host_id, endedAt, externalId)
  if (!meeting) return

  await releaseClaimOnFailure(externalId, async () => {
    const editor = new Editor({
      element: undefined,
      content: markdown,
      contentType: 'markdown',
      extensions: serverTipTapExtensions
    })
    const content = editor.getJSON() as unknown as TipTapSerializedPageContent
    await attachTranscriptToSummaryPage(
      meeting.summaryPageId,
      [{title: `Zoom Summary for ${meeting.name}`, content}],
      meeting.userId,
      externalId
    )
  })
}

export default zoomWebhookHandler
