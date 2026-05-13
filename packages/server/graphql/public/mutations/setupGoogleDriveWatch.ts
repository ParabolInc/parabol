import {google} from 'googleapis'
import appOrigin from '../../../appOrigin'
import {signGdriveToken} from '../../../integrations/gdrive/gdriveWebhookToken'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const CHANNEL_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days (Google's max)

const setupGoogleDriveWatch: MutationResolvers['setupGoogleDriveWatch'] = async (
  _source,
  {teamId},
  {authToken, dataLoader}
) => {
  const userId = getUserId(authToken)

  const gdriveAuth = await dataLoader.get('freshGdriveAuth').load({teamId, userId})
  if (!gdriveAuth) {
    return standardError(new Error('Google Drive not connected for this team'), {userId})
  }

  const {accessToken: access_token, refreshToken: refresh_token, expiresAt} = gdriveAuth
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return standardError(new Error('Google OAuth credentials not configured'), {userId})
  }

  const expiry_date = expiresAt ? expiresAt.getTime() : undefined
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, appOrigin)
  oauth2Client.setCredentials({access_token, refresh_token, expiry_date})
  const drive = google.drive({version: 'v3', auth: oauth2Client})

  // Find the "Meet Recordings" folder
  const folderRes = await drive.files.list({
    q: "name='Meet Recordings' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: 'files(id, name)',
    spaces: 'drive'
  })

  const folder = folderRes.data.files?.[0]
  if (!folder?.id) {
    return standardError(
      new Error(
        'Could not find a "Meet Recordings" folder in your Google Drive. Make sure Google Meet is configured to save recordings to Drive.'
      ),
      {userId}
    )
  }

  const folderId = folder.id
  const channelId = crypto.randomUUID()

  const webhookUrl = `${process.env.DEV_WEBHOOK_URL || appOrigin}/gdrive`

  const watchRes = await drive.files.watch({
    fileId: folderId,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      expiration: String(Date.now() + CHANNEL_TTL_SECONDS * 1000),
      token: signGdriveToken({userId, teamId, folderId})
    }
  })

  if (!watchRes.data.resourceId) {
    return standardError(new Error('Failed to set up Google Drive watch channel'), {userId})
  }

  return {channelId}
}

export default setupGoogleDriveWatch
