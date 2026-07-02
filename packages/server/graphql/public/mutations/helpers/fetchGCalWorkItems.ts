import {google} from 'googleapis'
import appOrigin from '../../../../appOrigin'
import {Logger} from '../../../../utils/Logger'
import type {DataLoaderWorker} from '../../../graphql'
import {formatWorkItemsForAI, MAX_WORK_ITEMS, type WorkItem} from './workItemsForAI'

// Re-runs the Google Calendar search the user saw in the Your Work drawer, server-side, fetching
// each event's full description, location, and attendees so the AI has enough context to draft a
// response. The client serializes the tab's {startDate, endDate} window as JSON into searchQuery;
// we parse it back and re-run the same events.list query. Returns a compact text blob suitable for
// an LLM prompt, or '' if there's nothing.
const fetchGCalWorkItems = async (
  teamId: string,
  userId: string,
  searchQuery: string,
  dataLoader: DataLoaderWorker
): Promise<string> => {
  const gcalAuth = await dataLoader.get('freshGcalAuth').load({teamId, userId})
  if (!gcalAuth) return ''

  let range: {startDate?: string; endDate?: string}
  try {
    range = searchQuery ? JSON.parse(searchQuery) : {}
  } catch {
    Logger.error('fetchGCalWorkItems: could not parse searchQuery as a date range')
    return ''
  }
  const {startDate, endDate} = range
  if (!startDate || !endDate) return ''

  const {accessToken: access_token, refreshToken: refresh_token, expiresAt} = gcalAuth
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const REDIRECT_URI = appOrigin
  const expiry_date = expiresAt ? expiresAt.getTime() : undefined

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  oauth2Client.setCredentials({access_token, refresh_token, expiry_date})
  const calendar = google.calendar({version: 'v3', auth: oauth2Client})

  const now = Date.now()
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      maxResults: MAX_WORK_ITEMS,
      orderBy: 'startTime',
      singleEvents: true,
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString()
    })
    const events = response.data.items ?? []
    const items = events.map((event): WorkItem => {
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
        subtitle,
        status,
        description: event.description
      }
    })
    return formatWorkItemsForAI(items)
  } catch (e) {
    Logger.error(e instanceof Error ? e.message : String(e))
    return ''
  }
}

export default fetchGCalWorkItems
