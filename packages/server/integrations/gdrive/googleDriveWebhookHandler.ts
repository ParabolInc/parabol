import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {type docs_v1, type drive_v3, google} from 'googleapis'
import {hasGdriveDocsScope} from 'parabol-client/shared/gdriveScopes'
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
import {googleDocToPages} from './googleDocToPages'
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

const getHttpStatus = (e: unknown) => {
  if (typeof e !== 'object' || e === null) return null
  const {status, code} = e as {status?: unknown; code?: unknown}
  if (typeof status === 'number') return status
  return typeof code === 'number' ? code : null
}

const isRateLimited = (e: unknown) => {
  if (typeof e !== 'object' || e === null) return false
  const {errors} = e as {errors?: unknown}
  return (
    Array.isArray(errors) &&
    errors.some((err) => /rateLimit/i.test(String((err as {reason?: unknown})?.reason ?? '')))
  )
}

const isUnavailable = (e: unknown) => {
  const status = getHttpStatus(e)
  return (status === 404 || status === 403) && !isRateLimited(e)
}

// files.export currently 404s for Google Docs under drive.meet.readonly, so the Docs API is
// preferred when its scope was granted; null = content unavailable, link to the doc instead
const fetchDocPages = async (
  drive: drive_v3.Drive,
  docs: docs_v1.Docs | null,
  fileId: string
): Promise<TranscriptPageInput[] | null> => {
  if (docs) {
    try {
      const {data} = await docs.documents.get({documentId: fileId, includeTabsContent: true})
      return googleDocToPages(data)
    } catch (e) {
      if (!isUnavailable(e)) throw e
    }
  }
  try {
    const resp = await drive.files.export({fileId, mimeType: 'text/markdown'})
    const markdown = typeof resp.data === 'string' ? resp.data : ''
    return splitMarkdownIntoPages(markdown)
  } catch (e) {
    if (isUnavailable(e)) return null
    throw e
  }
}

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
    const docs = hasGdriveDocsScope(gdriveAuth.scopes)
      ? google.docs({version: 'v1', auth: oauth2Client})
      : null

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

      let pages: TranscriptPageInput[] | null = []
      try {
        pages = await fetchDocPages(drive, docs, file.id)
      } catch (e) {
        await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
        Logger.log(e)
        continue
      }
      if (pages === null) {
        if (!file.webViewLink) {
          await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
          continue
        }
        Logger.log('gdrive doc content unavailable, linking doc instead', {tags: {fileId: file.id}})
        pages = [getGoogleDocLinkPage(file.name, file.webViewLink)]
      } else if (pages.length === 0) {
        // Gemini is still writing; release the row so the next notification retries
        await pg.deleteFrom('ExternalMeetingFile').where('id', '=', externalId).execute()
        continue
      }
      await attachTranscriptToSummaryPage(meeting.summaryPageId, pages, userId, externalId)
    }
  } finally {
    dataLoader.dispose()
  }
}

export default googleDriveWebhookHandler
