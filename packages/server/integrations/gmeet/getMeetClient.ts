import {google} from 'googleapis'
import appOrigin from '../../appOrigin'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'

export const getMeetClient = (gmeetAuth: TeamMemberIntegrationAuth) => {
  const {accessToken: access_token, refreshToken: refresh_token, expiresAt} = gmeetAuth
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET')
  }
  const expiry_date = expiresAt ? expiresAt.getTime() : undefined
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, appOrigin)
  oauth2Client.setCredentials({access_token, refresh_token, expiry_date})
  return google.meet({version: 'v2', auth: oauth2Client})
}
