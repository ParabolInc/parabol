import {google} from 'googleapis'
import {GraphQLError} from 'graphql'
import appOrigin from '../../appOrigin'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'

export const getMeetClient = (gdriveAuth: TeamMemberIntegrationAuth) => {
  const {accessToken: access_token, refreshToken: refresh_token, expiresAt} = gdriveAuth
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new GraphQLError('Google OAuth credentials not configured')
  }
  const expiry_date = expiresAt ? expiresAt.getTime() : undefined
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, appOrigin)
  oauth2Client.setCredentials({access_token, refresh_token, expiry_date})
  return google.meet({version: 'v2', auth: oauth2Client})
}
