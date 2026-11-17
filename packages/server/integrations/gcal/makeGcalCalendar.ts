import * as google from 'googleapis/build/src/apis/calendar'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import makeGoogleOAuth2Client from '../helpers/makeGoogleOAuth2Client'

const makeGcalCalendar = (
  auth: Pick<TeamMemberIntegrationAuth, 'accessToken' | 'refreshToken' | 'expiresAt'>
) => google.calendar({version: 'v3', auth: makeGoogleOAuth2Client(auth)})

export default makeGcalCalendar
