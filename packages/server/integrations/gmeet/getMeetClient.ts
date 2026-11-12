import * as google from 'googleapis/build/src/apis/meet'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import makeGoogleOAuth2Client from '../helpers/makeGoogleOAuth2Client'

export const getMeetClient = (gmeetAuth: TeamMemberIntegrationAuth) => {
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET')
  }
  return google.meet({version: 'v2', auth: makeGoogleOAuth2Client(gmeetAuth)})
}
