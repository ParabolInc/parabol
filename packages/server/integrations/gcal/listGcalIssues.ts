import type {calendar_v3} from 'googleapis/build/src/apis/calendar'
import {Logger} from '../../utils/Logger'
import {
  compareNewestFirst,
  type InspirationIssue,
  type IssuePage
} from '../platform/InspirationIssue'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import makeGcalCalendar from './makeGcalCalendar'

// Google Calendar only lists events oldest first, so finding the newest means reading the whole window
const MAX_EVENTS = 1000
const EVENTS_PER_REQUEST = 250

// Re-runs the Google Calendar search the user saw in the Your Work drawer, server-side, fetching
// each event's full description, location, and attendees so the AI has enough context to draft a
// response. The client serializes the tab's {startDate, endDate} window as JSON into searchQuery;
// we parse it back and re-run the same events.list query. Returns the normalized issues,
// or [] if there's nothing.
const listGcalIssues = async (
  ctx: GqlIntegrationCtx,
  searchQuery: string,
  {before, first}: IssuePage
): Promise<InspirationIssue[]> => {
  const {dataLoader, teamId, userId} = ctx
  const gcalAuth = await dataLoader.get('freshAuth').load({service: 'gcal', teamId, userId})
  if (!gcalAuth) return []

  let range: {startDate?: string; endDate?: string}
  try {
    range = searchQuery ? JSON.parse(searchQuery) : {}
  } catch {
    Logger.error('listGcalIssues: could not parse searchQuery as a date range')
    return []
  }
  const {startDate, endDate} = range
  if (!startDate || !endDate) return []

  const calendar = makeGcalCalendar(gcalAuth)
  const end = new Date(endDate)

  const now = Date.now()
  try {
    const events: calendar_v3.Schema$Event[] = []
    let pageToken: string | undefined
    do {
      const response = await calendar.events.list({
        calendarId: 'primary',
        maxResults: EVENTS_PER_REQUEST,
        orderBy: 'startTime',
        singleEvents: true,
        timeMin: new Date(startDate).toISOString(),
        timeMax: (before && before < end ? before : end).toISOString(),
        pageToken
      })
      events.push(...(response.data.items ?? []))
      pageToken = response.data.nextPageToken ?? undefined
    } while (pageToken && events.length < MAX_EVENTS)
    const items = events.map((event): InspirationIssue => {
      const startString = event.start?.dateTime ?? event.start?.date
      const endString = event.end?.dateTime ?? event.end?.date
      const start = startString ? new Date(startString) : undefined
      const end = endString ? new Date(endString) : undefined
      const reference = start
        ? start.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })
        : 'undated'
      // The AI uses status to pick verb tense: an event that already ended is past work.
      const status = end && end.getTime() < now ? 'past (complete)' : 'upcoming (in progress)'
      const attendees = (event.attendees ?? [])
        .map((attendee) => attendee.displayName ?? attendee.email)
        .filter(Boolean)
        .join(', ')
      const subtitle =
        [event.location && `Location: ${event.location}`, attendees && `Attendees: ${attendees}`]
          .filter(Boolean)
          .join(' · ') || undefined
      return {
        kind: 'Calendar Event',
        title: event.summary ?? '(untitled event)',
        reference,
        url: event.htmlLink ?? '',
        updatedAt: start ?? null,
        subtitle,
        status,
        description: event.description
      }
    })
    return items.sort(compareNewestFirst).slice(0, first)
  } catch (e) {
    Logger.error(e instanceof Error ? e.message : String(e))
    return []
  }
}

export default listGcalIssues
