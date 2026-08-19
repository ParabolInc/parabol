import {google} from 'googleapis'
import {GraphQLError} from 'graphql'
import appOrigin from '../../appOrigin'
import getKysely from '../../postgres/getKysely'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import {signGdriveToken} from './gdriveWebhookToken'

const GDRIVE_CHANNEL_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days (Google's max)

export const setupGdriveFileWatcher = async (
  gdriveAuth: Pick<TeamMemberIntegrationAuth, 'accessToken' | 'refreshToken' | 'expiresAt'>,
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

  const {data: startPage} = await drive.changes.getStartPageToken()
  const pageToken = startPage.startPageToken
  if (!pageToken) {
    throw new GraphQLError('Failed to read Google Drive change token')
  }

  const channelId = crypto.randomUUID()
  const webhookUrl = `${process.env.DEV_WEBHOOK_URL || appOrigin}/gdrive`

  const watchRes = await drive.changes.watch({
    pageToken,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      expiration: String(Date.now() + GDRIVE_CHANNEL_TTL_MS),
      token: signGdriveToken({userId, teamId})
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
