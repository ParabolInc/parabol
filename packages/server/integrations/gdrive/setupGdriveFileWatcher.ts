import {google} from 'googleapis'
import {GraphQLError} from 'graphql'
import appOrigin from '../../appOrigin'
import getKysely from '../../postgres/getKysely'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import {signGdriveToken} from './gdriveWebhookToken'

const GDRIVE_CHANNEL_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days (Google's max)

export const setupGdriveFileWatcher = async (
  gdriveAuth: TeamMemberIntegrationAuth,
  userId: string,
  teamId: string
): Promise<Date | null> => {
  const {accessToken: access_token, refreshToken: refresh_token, expiresAt} = gdriveAuth
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new GraphQLError('Google OAuth credentials not configured')
  }

  const expiry_date = expiresAt ? expiresAt.getTime() : undefined
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, appOrigin)
  oauth2Client.setCredentials({access_token, refresh_token, expiry_date})
  const drive = google.drive({version: 'v3', auth: oauth2Client})

  const folderRes = await drive.files.list({
    q: "name='Meet Recordings' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: 'files(id, name)',
    spaces: 'drive'
  })

  const folderId = folderRes.data.files?.[0]?.id
  if (!folderId) {
    throw new GraphQLError(
      'Could not find a "Meet Recordings" folder in your Google Drive. Manually add the folder in your Drive or record one Google Meet and try again.'
    )
  }

  const channelId = crypto.randomUUID()
  const webhookUrl = `${process.env.DEV_WEBHOOK_URL || appOrigin}/gdrive`

  const watchRes = await drive.files.watch({
    fileId: folderId,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      expiration: String(Date.now() + GDRIVE_CHANNEL_TTL_MS),
      token: signGdriveToken({userId, teamId, folderId})
    }
  })

  if (!watchRes.data.resourceId) {
    throw new GraphQLError('Failed to set up Google Drive watch channel')
  }

  const watchExpiresAt = watchRes.data.expiration
    ? new Date(Number(watchRes.data.expiration))
    : null

  await getKysely()
    .updateTable('TeamMemberIntegrationAuth')
    .set({watchExpiresAt})
    .where('userId', '=', userId)
    .where('teamId', '=', teamId)
    .where('service', '=', 'gdrive')
    .execute()

  return watchExpiresAt
}
