import {type drive_v3, google} from 'googleapis'
import {GraphQLError} from 'graphql'
import appOrigin from '../../appOrigin'
import getKysely from '../../postgres/getKysely'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import {signGdriveToken} from './gdriveWebhookToken'

const GDRIVE_CHANNEL_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days (Google's max)

const createChangesChannel = async (drive: drive_v3.Drive, channel: drive_v3.Schema$Channel) => {
  try {
    const {data: startPage} = await drive.changes.getStartPageToken()
    const pageToken = startPage.startPageToken
    if (!pageToken) {
      throw new GraphQLError('Failed to read Google Drive change token')
    }
    const {data} = await drive.changes.watch({pageToken, requestBody: channel})
    return data
  } catch (e) {
    if (e instanceof GraphQLError) throw e
    const message = e instanceof Error ? e.message : 'unknown error'
    throw new GraphQLError(`Google Drive: ${message}`)
  }
}

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

  const channelId = crypto.randomUUID()
  const webhookUrl = `${process.env.DEV_WEBHOOK_URL || appOrigin}/gdrive`

  const channel = await createChangesChannel(drive, {
    id: channelId,
    type: 'web_hook',
    address: webhookUrl,
    expiration: String(Date.now() + GDRIVE_CHANNEL_TTL_MS),
    token: signGdriveToken({userId, teamId})
  })
  if (!channel.resourceId) {
    throw new GraphQLError('Failed to set up Google Drive watch channel')
  }

  const watchExpiresAt = channel.expiration ? new Date(Number(channel.expiration)) : null

  await getKysely()
    .updateTable('TeamMemberIntegrationAuth')
    .set({watchExpiresAt})
    .where('userId', '=', userId)
    .where('teamId', '=', teamId)
    .where('service', '=', 'gdrive')
    .execute()

  return watchExpiresAt
}
