import {google} from 'googleapis'
import appOrigin from '../../../appOrigin'
import {GcalIntegrationResolvers} from '../resolverTypes'

export type GcalIntegrationSource = {
  teamId: string
  userId: string
}

const GcalIntegration: GcalIntegrationResolvers = {
  auth: ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('freshGcalAuth').load({teamId, userId})
  },
  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gcal', orgIds: [], teamIds: []})
    if (!globalProvider) return null
    return globalProvider
  },
  events: async ({teamId, userId}, {startDate, endDate}, {dataLoader}) => {
    const gcalAuth = await dataLoader.get('freshGcalAuth').load({teamId, userId})
    if (!gcalAuth) {
      return []
    }
    const {accessToken: access_token, refreshToken: refresh_token, expiresAt} = gcalAuth

    const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
    const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
    const REDIRECT_URI = appOrigin

    const expiry_date = expiresAt ? expiresAt.getTime() : undefined

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
    oauth2Client.setCredentials({access_token, refresh_token, expiry_date})
    const calendar = google.calendar({version: 'v3', auth: oauth2Client})
    const calendarEventResponse = await calendar.events.list({
      calendarId: 'primary',
      maxAttendees: 1,
      maxResults: 100,
      orderBy: 'startTime',
      singleEvents: true,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString()
    })

    const calendarEventBody = calendarEventResponse.data
    const events = calendarEventBody.items
    if (!events) {
      return []
    }

    return events.map((rawEvent) => {
      const startDateString = rawEvent.start?.dateTime ?? rawEvent.start?.date
      const endDateString = rawEvent.end?.dateTime ?? rawEvent.end?.date
      return {
        summary: rawEvent.summary,
        startDate: startDateString ? new Date(startDateString) : undefined,
        endDate: endDateString ? new Date(endDateString) : undefined,
        link: rawEvent.htmlLink
      }
    })
  }
}

export default GcalIntegration
