import ms from 'ms'
import {MEETING_NAME} from './constants'
import ensureDate from './ensureDate'
import roundDateToNearestHalfHour from './roundDateToNearestHalfHour'

// the ICS doesn't get the 'Add your conference' line because it doesn't accept line breaks. that's cool though because it isn't editable
const description = `Our weekly meeting to update each other on our progress, build and process an agenda to unblock one another and track new tasks.
Add your conference or dial-in bridge information here.`

const getStartTime = (createdAt: Date) => {
  const newTime = roundDateToNearestHalfHour(new Date(createdAt.getTime() + ms('7d')))

  // start
  const start = newTime.toISOString().replace(/-|:|\.\d\d\d/g, '')

  // end
  const DURATION = ms('30m')
  const endTime = new Date(newTime.getTime() + DURATION)
  const end = endTime.toISOString().replace(/-|:|\.\d\d\d/g, '')

  return `${start}/${end}`
}

export const createGoogleCalendarInviteURL = (
  maybeCreatedAt: unknown,
  meetingUrl: string,
  teamName: string
) => {
  const createdAt = ensureDate(maybeCreatedAt)
  const text = `${MEETING_NAME} for ${teamName}`
  return encodeURI(
    `http://www.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${description}&dates=${getStartTime(
      createdAt
    )}&trp=true&location=${meetingUrl}&sprop=${meetingUrl}&sprop=name:${teamName} ${MEETING_NAME}`
  )
}

export const createICS = (maybeCreatedAt: unknown, meetingUrl: string, teamName: string) => {
  const createdAt = ensureDate(maybeCreatedAt)
  const [startTime, endTime] = getStartTime(createdAt).split('/')
  // it's ugly, but if you mess with the indention here, you eff up the world
  return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:parabol.co
X-PUBLISHED-TTL:P1W
BEGIN:VEVENT
UID:${startTime}
DTSTART:${startTime}
SEQUENCE:0
TRANSP:OPAQUE
DTEND:${endTime}
LOCATION:${meetingUrl}
SUMMARY:Star Wars Day Party
DESCRIPTION:${description}
CLASS:PUBLIC
SUMMARY:${MEETING_NAME} for ${teamName}
CLASS:PUBLIC
DTSTAMP:${startTime}
RRULE:FREQ=WEEKLY;COUNT=8
END:VEVENT
END:VCALENDAR`
}

export const makeIcsUrl = (maybeCreatedAt: unknown, meetingUrl: string, teamName: string) => {
  const createdAt = ensureDate(maybeCreatedAt)
  const baseUrl = meetingUrl.substr(0, meetingUrl.indexOf('/meeting'))
  return `${baseUrl}/email/createics?teamName=${teamName}&createdAt=${createdAt.getTime()}&meetingUrl=${meetingUrl}`
}
