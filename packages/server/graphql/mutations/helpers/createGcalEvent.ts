import {google} from 'googleapis'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {DataLoaderWorker} from '../../graphql'
import standardError from '../../../utils/standardError'
import {CreateGcalEventInput} from '../../public/resolverTypes'

const emailRemindMinsBeforeMeeting = 24 * 60
const popupRemindMinsBeforeMeeting = 10

type Input = {
  gcalInput?: CreateGcalEventInput | null
  meetingId: string
  viewerId: string
  teamId: string
  dataLoader: DataLoaderWorker
}

const createGcalEvent = async (input: Input) => {
  const {gcalInput, meetingId, viewerId, dataLoader, teamId} = input
  if (!gcalInput) {
    return {error: null}
  }
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const {featureFlags} = viewer
  if (!featureFlags.includes('gcal')) {
    return standardError(new Error('Does not have gcal feature flag'), {userId: viewerId})
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

  const event = {
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
    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unable to create event in gcal')
    return standardError(error, {userId: viewerId})
  }
  return {
    error: null
  }
}

export default createGcalEvent
