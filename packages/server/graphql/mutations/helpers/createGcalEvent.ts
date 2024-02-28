import {google} from 'googleapis'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {DataLoaderWorker} from '../../graphql'
import standardError from '../../../utils/standardError'
import {CreateGcalEventInput, StandardMutationError} from '../../public/resolverTypes'
import {RRule} from 'rrule'
import {pick} from 'lodash'

const emailRemindMinsBeforeMeeting = 24 * 60
const popupRemindMinsBeforeMeeting = 10

const convertRruleToGcal = (rrule: RRule | null | undefined) => {
  if (!rrule) {
    return []
  }

  // Google does not allow for all fields in rrule. For example DTSTART and DTEND are not allowed.
  // It also has trouble with BYHOUR, BYMINUTE, and BYSECOND. It's best to stick to fields known to work.
  // Also strip TZID as google wants the UNTIL field in Z, but rrule only uses that if no TZID is present.
  const options = pick(rrule.options, 'freq', 'interval', 'byweekday', 'until', 'count')
  const gcalRule = new RRule(options)
  return [gcalRule.toString()]
}

type Input = {
  gcalInput?: CreateGcalEventInput | null
  meetingId: string
  viewerId: string
  teamId: string
  rrule?: RRule | null
  dataLoader: DataLoaderWorker
}

const createGcalEvent = async (
  input: Input
): Promise<{gcalSeriesId?: string; error?: StandardMutationError}> => {
  const {gcalInput, meetingId, viewerId, dataLoader, teamId, rrule} = input
  if (!gcalInput) {
    return {}
  }

  const {startTimestamp, endTimestamp, title, timeZone, invitees, videoType} = gcalInput

  const gcalAuth = await dataLoader.get('freshGcalAuth').load({teamId, userId: viewerId})
  if (!gcalAuth) {
    return standardError(new Error('Could not retrieve Google Calendar auth'), {userId: viewerId})
  }
  const {accessToken: access_token, refreshToken: refresh_token, expiresAt} = gcalAuth
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const REDIRECT_URI = appOrigin

  const startDateTime = new Date(startTimestamp * 1000).toISOString()
  const endDateTime = new Date(endTimestamp * 1000).toISOString()
  const expiry_date = expiresAt ? expiresAt.getTime() : undefined

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  oauth2Client.setCredentials({access_token, refresh_token, expiry_date})
  const calendar = google.calendar({version: 'v3', auth: oauth2Client})
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)
  const attendeesWithEmailObjects = invitees?.map((email) => ({email}))
  const description = `Here's the link to your Parabol meeting: ${meetingUrl}

` // add a newline to separate the link from the rest of the description

  const conferenceData =
    videoType === 'meet'
      ? {
          createRequest: {
            requestId: meetingId,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      : undefined
  const recurrence = convertRruleToGcal(rrule)

  const eventInput = {
    summary: title,
    description,
    start: {
      dateTime: startDateTime,
      timeZone
    },
    end: {
      dateTime: endDateTime,
      timeZone
    },
    recurrence,
    attendees: attendeesWithEmailObjects,
    reminders: {
      useDefault: false,
      overrides: [
        {method: 'email', minutes: emailRemindMinsBeforeMeeting},
        {method: 'popup', minutes: popupRemindMinsBeforeMeeting}
      ]
    },
    conferenceData
  }

  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventInput,
      conferenceDataVersion: 1
    })
    return {gcalSeriesId: event.data.id ?? undefined}
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unable to create event in gcal')
    return standardError(error, {userId: viewerId})
  }
}

export type UpdateGcalSeriesInput = {
  gcalSeriesId: string
  title?: string
  rrule: RRule | null
  userId: string
  teamId: string
  dataLoader: DataLoaderWorker
}
export const updateGcalSeries = async (input: UpdateGcalSeriesInput) => {
  const {gcalSeriesId, title, rrule, userId, teamId, dataLoader} = input

  const gcalAuth = await dataLoader.get('freshGcalAuth').load({teamId, userId})
  if (!gcalAuth) {
    return standardError(new Error('Could not retrieve Google Calendar auth'), {userId})
  }
  const {accessToken: access_token, refreshToken: refresh_token, expiresAt} = gcalAuth
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const REDIRECT_URI = appOrigin

  const expiry_date = expiresAt ? expiresAt.getTime() : undefined

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  oauth2Client.setCredentials({access_token, refresh_token, expiry_date})
  const calendar = google.calendar({version: 'v3', auth: oauth2Client})
  const recurrence = convertRruleToGcal(rrule)

  try {
    const event = await calendar.events.patch({
      calendarId: 'primary',
      eventId: gcalSeriesId,
      requestBody: {
        recurrence,
        summary: title
      },
      conferenceDataVersion: 1
    })
    return {gcalSeriesId: event.data.id ?? undefined}
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unable to create event in gcal')
    return standardError(error, {userId})
  }
}

export default createGcalEvent
