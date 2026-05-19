import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {fetch} from '@whatwg-node/fetch'
import {createHmac, timingSafeEqual} from 'crypto'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'
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
  event: string
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
}

type ZoomUrlValidationPayload = {
  event: 'endpoint.url_validation'
  payload: {plainToken: string}
}

type ZoomWebhookPayload = ZoomRecordingCompletedPayload | ZoomUrlValidationPayload

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
    const {plainToken} = (payload as ZoomUrlValidationPayload).payload
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

  if (payload.event === 'recording.completed') {
    processRecording(payload as ZoomRecordingCompletedPayload).catch(Logger.log)
  }
})

const processRecording = async (payload: ZoomRecordingCompletedPayload) => {
  const {host_id, uuid, start_time, duration, recording_files} = payload.payload.object

  const transcriptFile = recording_files.find(
    (f) => f.file_type === 'TRANSCRIPT' && f.file_extension === 'VTT' && f.status === 'completed'
  )
  if (!transcriptFile) return

  const pg = getKysely()

  // Find which Parabol user/team owns this Zoom host
  const authRow = await pg
    .selectFrom('TeamMemberIntegrationAuth')
    .selectAll()
    .where('providerUserId', '=', host_id)
    .where('service', '=', 'zoom')
    .where('isActive', '=', true)
    .orderBy('updatedAt', 'desc')
    .executeTakeFirst()

  if (!authRow) return

  const {userId, teamId, accessToken} = authRow
  if (!accessToken) return

  const externalId = `zoom:${uuid}`
  const insertResult = await pg
    .insertInto('ExternalMeetingFile')
    .values({id: externalId, teamId})
    .onConflict((oc) => oc.column('id').doNothing())
    .executeTakeFirst()
  if (insertResult.numInsertedOrUpdatedRows === 0n) return

  // Meeting end time = start_time + duration (minutes)
  const startMs = new Date(start_time).getTime()
  const endedAt = new Date(startMs + duration * 60 * 1000)
  const meeting = await matchExternalMeetingToMeeting(endedAt, teamId)
  if (!meeting) {
    await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
    return
  }

  // Fetch the VTT transcript using the host's access token
  const vttRes = await fetch(`${transcriptFile.download_url}?access_token=${accessToken}`)
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

export default zoomWebhookHandler
