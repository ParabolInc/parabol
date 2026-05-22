import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {Editor} from '@tiptap/core'
import {fetch} from '@whatwg-node/fetch'
import {createHmac, timingSafeEqual} from 'crypto'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'
import {createNewPage} from '../../utils/tiptap/createNewPage'
import {attachTranscriptToSummaryPage} from '../gdrive/attachTranscriptToSummaryPage'
import {matchExternalMeetingToMeeting} from '../matchExternalMeetingToMeeting'
import {processZoomTranscript} from './processZoomTranscript'

type ZoomRecordingFile = {
  id: string
  file_type: string
  file_extension: string
  download_url: string
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
      summary_content: string
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

const zoomWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN

  if (!secret) {
    res.writeStatus('500').end()
    return
  }

  const timestamp = req.getHeader('x-zm-request-timestamp')
  const signature = req.getHeader('x-zm-signature')

  const rawBody = await parseBody<string>({res, parser: (buf) => buf.toString()})
  if (!rawBody) {
    res.writeStatus('400').end()
    return
  }

  // Handle Zoom's endpoint URL validation challenge
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

  // All other events require signature verification
  if (!timestamp || !signature || !verifyZoomSignature(secret, timestamp, rawBody, signature)) {
    res.writeStatus('401').end()
    return
  }

  res.writeStatus('200 OK').end()
  dispatchZoomEvent(payload).catch(Logger.log)
})

const dispatchZoomEvent = async (payload: ZoomWebhookPayload) => {
  const pg = getKysely()

  let hostId: string
  let meetingUuid: string
  let eventType: 'transcript' | 'summary'

  if (payload.event === 'recording.transcript_completed') {
    hostId = payload.payload.object.host_id
    meetingUuid = payload.payload.object.uuid
    eventType = 'transcript'
  } else if (payload.event === 'meeting.summary_completed') {
    hostId = payload.payload.object.meeting_host_id
    meetingUuid = payload.payload.object.meeting_uuid
    eventType = 'summary'
  } else {
    return
  }

  const authRow = await pg
    .selectFrom('TeamMemberIntegrationAuth')
    .selectAll()
    .where('providerUserId', '=', hostId)
    .where('service', '=', 'zoom')
    .where('isActive', '=', true)
    .orderBy('updatedAt', 'desc')
    .executeTakeFirst()

  if (!authRow) return
  const {userId, teamId} = authRow

  const externalId = `zoom:${eventType}:${meetingUuid}`
  const insertResult = await pg
    .insertInto('ExternalMeetingFile')
    .values({id: externalId, teamId})
    .onConflict((oc) => oc.column('id').doNothing())
    .executeTakeFirst()
  if (insertResult.numInsertedOrUpdatedRows === 0n) return
  if (payload.event === 'recording.transcript_completed') {
    await processTranscriptCompleted(payload, userId, teamId, externalId)
  } else {
    await processSummaryCompleted(payload, userId, teamId, externalId)
  }
}

const processTranscriptCompleted = async (
  payload: ZoomRecordingCompletedPayload,
  userId: string,
  teamId: string,
  externalId: string
) => {
  const {download_token} = payload
  const {start_time, duration, recording_files} = payload.payload.object
  const transcriptFile = recording_files.find(
    (f) => f.file_type === 'TRANSCRIPT' && f.file_extension === 'VTT' && f.status === 'completed'
  )
  if (!transcriptFile) return

  const pg = getKysely()

  // Meeting end time = start_time + duration (minutes)
  const startMs = new Date(start_time).getTime()
  const endedAt = new Date(startMs + duration * 60 * 1000)
  const meeting = await matchExternalMeetingToMeeting(endedAt, teamId)
  if (!meeting) {
    await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
    return
  }

  const vttRes = await fetch(transcriptFile.download_url, {
    headers: {Authorization: `Bearer ${download_token}`}
  })
  if (!vttRes.ok) {
    await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
    return
  }
  const vtt = await vttRes.text()
  if (!vtt.trim()) {
    await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
    return
  }

  const pages = processZoomTranscript(vtt)
  if (pages.length === 0) {
    await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
    return
  }

  const {summaryPageId} = meeting
  if (summaryPageId) {
    await attachTranscriptToSummaryPage(summaryPageId, pages, userId)
    await pg
      .updateTable('ExternalMeetingFile')
      .set({summaryPageId})
      .where('id', '=', externalId)
      .execute()
  }
}

const processSummaryCompleted = async (
  payload: ZoomSummaryCompletedPayload,
  userId: string,
  teamId: string,
  externalId: string
) => {
  const {meeting_topic, meeting_end_time, summary_title, summary_content} = payload.payload.object
  const trimmed = summary_content.trim()
  if (!trimmed) return

  const pg = getKysely()
  const endedAt = new Date(meeting_end_time)
  const meeting = await matchExternalMeetingToMeeting(endedAt, teamId)
  if (!meeting) {
    await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
    return
  }

  const title = summary_title || meeting_topic
  const markdown = title ? `# ${title}\n\n${trimmed}` : trimmed
  const editor = new Editor({
    element: undefined,
    content: markdown,
    contentType: 'markdown',
    extensions: serverTipTapExtensions
  })

  const page = await createNewPage({
    content: editor.getJSON() as unknown as TipTapSerializedPageContent,
    teamId,
    summaryMeetingId: meeting.id,
    userId
  })

  await Promise.all([
    pg
      .updateTable('NewMeeting')
      .set({summaryPageId: page.id})
      .where('id', '=', meeting.id)
      .where('summaryPageId', 'is', null)
      .execute(),
    pg
      .updateTable('ExternalMeetingFile')
      .set({summaryPageId: page.id})
      .where('id', '=', externalId)
      .execute()
  ])
}

export default zoomWebhookHandler
