import makeGcalCalendar from '../../../integrations/gcal/makeGcalCalendar'
import type {GcalIntegrationResolvers} from '../resolverTypes'

export type GcalIntegrationSource = {
  teamId: string
  userId: string
}

const GcalIntegration: GcalIntegrationResolvers = {
  auth: ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('freshAuth').load({service: 'gcal', teamId, userId})
  },
  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gcal', orgIds: [], teamIds: []})
    if (!globalProvider) return null
    return globalProvider
  },
  events: async ({teamId, userId}, {startDate, endDate}, {dataLoader}) => {
    const gcalAuth = await dataLoader.get('freshAuth').load({service: 'gcal', teamId, userId})
    if (!gcalAuth) {
      return []
    }
    const calendar = makeGcalCalendar(gcalAuth)
    const calendarEventResponse = await calendar.events.list({
      calendarId: 'primary',
      // Cap the attendee list per event so we can display a meeting-size count without huge payloads
      maxAttendees: 100,
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
      const attendeeCount = rawEvent.attendees?.length ?? 0
      return {
        summary: rawEvent.summary,
        startDate: startDateString ? new Date(startDateString) : undefined,
        endDate: endDateString ? new Date(endDateString) : undefined,
        link: rawEvent.htmlLink,
        location: rawEvent.location,
        attendeeCount
      }
    })
  }
}

export default GcalIntegration
