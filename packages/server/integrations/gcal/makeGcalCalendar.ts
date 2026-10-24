import * as google from 'googleapis/build/src/apis/calendar'
import appOrigin from '../../appOrigin'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'

const makeGcalCalendar = (
  auth: Pick<TeamMemberIntegrationAuth, 'accessToken' | 'refreshToken' | 'expiresAt'>
) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    appOrigin
  )
  oauth2Client.setCredentials({
    access_token: auth.accessToken,
    refresh_token: auth.refreshToken,
    expiry_date: auth.expiresAt ? auth.expiresAt.getTime() : undefined
  })
  return google.calendar({version: 'v3', auth: oauth2Client})
}

export default makeGcalCalendar
