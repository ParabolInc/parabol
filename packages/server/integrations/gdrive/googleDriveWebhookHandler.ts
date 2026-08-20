import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {google} from 'googleapis'
import {hasGdriveMeetingsScope} from 'parabol-client/shared/gdriveScopes'
import appOrigin from '../../appOrigin'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'
import {matchExternalMeetingToMeeting} from '../matchExternalMeetingToMeeting'
import {
  attachTranscriptToSummaryPage,
  type TranscriptPageInput
} from './attachTranscriptToSummaryPage'
import {verifyGdriveToken} from './gdriveWebhookToken'
import {getGoogleDocLinkPage} from './getGoogleDocLinkPage'
import {fetchMeetTranscript, isPermanentMeetApiError} from './meetTranscript'

const googleDriveWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const resourceState = req.getHeader('x-goog-resource-state')
  const tokenRaw = req.getHeader('x-goog-channel-token')

  // Respond immediately — Google requires a fast 200 response
  res.writeStatus('200 OK').end()

  // Google sends a 'sync' notification when the watch channel is first created — ignore it
  if (resourceState === 'sync' || !tokenRaw) return

  const payload = verifyGdriveToken(tokenRaw)
  if (!payload) return
  processNewFiles(payload).catch(Logger.log)
})

export const processNewFiles = async ({userId, teamId}: {userId: string; teamId: string}) => {
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!CLIENT_ID || !CLIENT_SECRET) return

  const dataLoader = getNewDataLoader('googleDriveWebhook')

  try {
    const gdriveAuth = await dataLoader.get('freshGdriveAuth').load({teamId, userId})
    if (!gdriveAuth) return

    const {accessToken: access_token, refreshToken: refresh_token, expiresAt} = gdriveAuth
    const expiry_date = expiresAt ? expiresAt.getTime() : undefined
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, appOrigin)
    oauth2Client.setCredentials({access_token, refresh_token, expiry_date})
    const drive = google.drive({version: 'v3', auth: oauth2Client})

    const filesRes = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document' and trashed=false",
      orderBy: 'createdTime desc',
      pageSize: 10,
      fields: 'files(id, name, createdTime, webViewLink)'
    })

    const files = filesRes.data.files ?? []
    const pg = getKysely()

    for (const file of files) {
      if (!file.id || !file.name || !file.createdTime) continue

      const externalId = `google:${file.id}`

      // Insert the dedup record early — on conflict (race condition), skip this file
      const insertResult = await pg
        .insertInto('ExternalMeetingFile')
        .values({id: externalId, teamId})
        .onConflict((oc) => oc.column('id').doNothing())
        .executeTakeFirst()
      if (insertResult.numInsertedOrUpdatedRows === 0n) continue
      const fileCreatedTime = new Date(file.createdTime)
      const meeting = await matchExternalMeetingToMeeting(fileCreatedTime, teamId)
      // release the dedup row so a later notification retries once the meeting has ended
      if (!meeting?.summaryPageId) {
        await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
        continue
      }

      let transcriptPage: TranscriptPageInput | null = null
      if (access_token && hasGdriveMeetingsScope(gdriveAuth.scopes)) {
        try {
          const content = await fetchMeetTranscript(access_token, file.id, fileCreatedTime)
          if (content) transcriptPage = {title: 'Transcript', content}
        } catch (e) {
          Logger.log(e)
          if (!isPermanentMeetApiError(e)) {
            // transient Meet API error — release the row so the next notification retries
            await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
            continue
          }
        }
      }
      // this doc is either the meeting's transcript (import it) or the Gemini notes (link it)
      const pagesToAttach = transcriptPage
        ? [transcriptPage]
        : file.webViewLink
          ? [getGoogleDocLinkPage(file.name, file.webViewLink)]
          : null
      if (!pagesToAttach) {
        await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
        continue
      }
      await attachTranscriptToSummaryPage(meeting.summaryPageId, pagesToAttach, userId, externalId)
    }
  } finally {
    dataLoader.dispose()
  }
}

export default googleDriveWebhookHandler
