import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {google} from 'googleapis'
import appOrigin from '../../appOrigin'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'
import {attachTranscriptToSummaryPage} from './attachTranscriptToSummaryPage'
import {verifyGdriveToken} from './gdriveWebhookToken'
import {matchGoogleMeetToMeeting} from './matchGoogleMeetToMeeting'
import {splitMarkdownIntoPages} from './processGoogleMeetFile'

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

const processNewFiles = async ({
  userId,
  teamId,
  folderId
}: {
  userId: string
  teamId: string
  folderId: string
}) => {
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

    // List recently modified files in the watched folder
    const filesRes = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      orderBy: 'createdTime desc',
      pageSize: 10,
      fields: 'files(id, name, mimeType, createdTime)'
    })

    const files = filesRes.data.files ?? []
    const pg = getKysely()

    for (const file of files) {
      if (!file.id || !file.name || !file.createdTime) continue
      if (file.mimeType !== 'application/vnd.google-apps.document') continue

      const externalId = `google:${file.id}`

      // Insert the dedup record early — on conflict (race condition), skip this file
      const insertResult = await pg
        .insertInto('ExternalMeetingFile')
        .values({id: externalId, teamId})
        .onConflict((oc) => oc.column('id').doNothing())
        .executeTakeFirst()
      if (insertResult.numInsertedOrUpdatedRows === 0n) continue
      const fileCreatedTime = new Date(file.createdTime)
      const meeting = await matchGoogleMeetToMeeting(fileCreatedTime, teamId)
      // Meeting hasn't ended yet or doesn't exist in Parabol. Exit
      if (!meeting) continue

      const resp = await drive.files.export({fileId: file.id, mimeType: 'text/markdown'})
      const markdown = (resp.data as string) ?? ''
      // Skip empty exports — docs are created before Gemini writes content;
      // the next webhook notification will arrive once the content is ready.
      // Do NOT mark as processed so the next notification retries this file.
      if (!markdown.trim()) {
        await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
        continue
      }

      const pages = splitMarkdownIntoPages(markdown)
      if (pages.length === 0) {
        await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
        continue
      }

      const {summaryPageId} = meeting
      if (summaryPageId) {
        await attachTranscriptToSummaryPage(summaryPageId, pages, userId)
      }
    }
  } finally {
    dataLoader.dispose()
  }
}

export default googleDriveWebhookHandler
