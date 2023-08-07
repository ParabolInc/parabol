import {google} from 'googleapis'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {DataLoaderWorker} from '../../graphql'
import standardError from '../../../utils/standardError'
import {CreateGcalEventInput} from '../../public/resolverTypes'

const emailRemindMinsBeforeMeeting = 24 * 60
const popupRemindMinsBeforeMeeting = 10

const getTeamMemberEmails = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  return teamMembers.map((teamMember) => teamMember.email)
}

type Input = {
  gcalInput?: CreateGcalEventInput | null
  meetingId: string
  teamId: string
  viewerId: string
  dataLoader: DataLoaderWorker
}

const createGcalEvent = async (input: Input) => {
  const {gcalInput, meetingId, teamId, viewerId, dataLoader} = input
  if (!gcalInput) return
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const {email: viewerEmail, featureFlags} = viewer
  if (!featureFlags.includes('gcal')) {
    return standardError(new Error('Does not have gcal feature flag'), {userId: viewerId})
  }
  const {startTimestamp, endTimestamp, title, description, inviteTeam, timeZone} = gcalInput

  // TODO: remove hardcoded token and use viewer's token
  const hardcodedToken = {
    access_token: process.env.GCAL_ACCESS_TOKEN,
    refresh_token: process.env.GCAL_REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/calendar',
    token_type: 'Bearer',
    expiry_date: 1234567890
  }
  const CLIENT_ID = process.env.GCAL_CLIENT_ID
  const CLIENT_SECRET = process.env.GCAL_CLIENT_SECRET
  const REDIRECT_URI = appOrigin

  const startDateTime = new Date(startTimestamp * 1000).toISOString()
  const endDateTime = new Date(endTimestamp * 1000).toISOString()

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  oauth2Client.setCredentials(hardcodedToken)
  const calendar = google.calendar({version: 'v3', auth: oauth2Client})
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)

  const attendees = inviteTeam ? await getTeamMemberEmails(teamId, dataLoader) : [viewerEmail]
  const attendeesWithEmailObjects = attendees.map((email) => ({email}))

  const event = {
    summary: title,
    location: meetingUrl,
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
    }
  }

  const createdEvent = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event
  })
  const gcalLink = createdEvent.data.htmlLink
  if (!gcalLink) {
    return standardError(new Error('Could not create event'), {userId: viewerId})
  }
  return {gcalLink}
}

export default createGcalEvent
