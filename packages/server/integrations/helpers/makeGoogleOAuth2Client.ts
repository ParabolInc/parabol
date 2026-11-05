import {OAuth2Client} from 'google-auth-library'
import appOrigin from '../../appOrigin'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'

const makeGoogleOAuth2Client = (
  auth: Pick<TeamMemberIntegrationAuth, 'accessToken' | 'refreshToken' | 'expiresAt'>
) => {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    appOrigin
  )
  oauth2Client.setCredentials({
    access_token: auth.accessToken,
    refresh_token: auth.refreshToken,
    expiry_date: auth.expiresAt?.getTime()
  })
  return oauth2Client
}

export default makeGoogleOAuth2Client
