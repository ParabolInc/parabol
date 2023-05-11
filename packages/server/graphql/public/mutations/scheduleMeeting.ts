import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'
import {google} from 'googleapis'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'

const scheduleMeeting: MutationResolvers['scheduleMeeting'] = async (
  _source,
  {meetingId, title, description, startTimestamp, endTimestamp, inviteTeam},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const now = new Date()

  // VALIDATION

  const hardcodedToken = {
    access_token: process.env.GCAL_ACCESS_TOKEN,
    refresh_token: process.env.GCAL_REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/calendar',
    token_type: 'Bearer',
    expiry_date: 1234567890
  }

  const CLIENT_ID = process.env.GCAL_CLIENT_ID
  const CLIENT_SECRET = process.env.GCAL_CLIENT_SECRET
  const REDIRECT_URI = 'http://localhost:3000/'

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  oauth2Client.setCredentials(hardcodedToken)
  const calendar = google.calendar({version: 'v3', auth: oauth2Client})
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)

  const event = {
    summary: title,
    location: meetingUrl,
    description: description,
    start: {
      dateTime: '2023-05-10T09:00:00-07:00',
      timeZone: 'America/Los_Angeles'
    },
    end: {
      dateTime: '2023-05-10T10:00:00-07:00',
      timeZone: 'America/Los_Angeles'
    },
    attendees: ['nick@parabol.co'],
    reminders: {
      useDefault: false,
      overrides: [
        {method: 'email', minutes: 24 * 60},
        {method: 'popup', minutes: 10}
      ]
    }
  }

  try {
    const createdEvent = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    })
    console.log('🚀 ~ createdEvent:', createdEvent)
  } catch (error) {
    console.error('Error creating event:', error)
  }

  // RESOLUTION
  const data = {meetingId: 'n0EGJHp7JS'}
  return data
}

export default scheduleMeeting
