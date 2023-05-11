import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'
import {google} from 'googleapis'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {DataLoaderWorker} from '../../graphql'
import standardError from '../../../utils/standardError'

const getTeamMemberEmails = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  return teamMembers.map((teamMember) => teamMember.email)
}

const createGcalEvent: MutationResolvers['createGcalEvent'] = async (
  _source,
  {input: {teamId, meetingId, startTimestamp, endTimestamp, title, description, inviteTeam}},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const viewerTeam = await dataLoader.get('teams').load(teamId)
  if (!viewerTeam) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  const viewer = await dataLoader.get('users').load(viewerId)
  const {email: viewerEmail} = viewer

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

  const startDateTime = new Date(startTimestamp * 1000).toISOString()
  const endDateTime = new Date(endTimestamp * 1000).toISOString()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

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
    const gcalLink = createdEvent.data.htmlLink
    if (!gcalLink) {
      return standardError(new Error('Could not create event'), {userId: viewerId})
    }
    return {gcalLink}
  } catch (error) {
    console.error('Error creating event:', error)
    return error
  }
}

export default createGcalEvent
