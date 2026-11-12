import dayjs from 'dayjs'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {toDateTime} from 'parabol-client/shared/rruleUtil'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
const immediateRrule = () => {
  const start = dayjs().utc().add(5, 'second')
  return `DTSTART;TZID=UTC:${toDateTime(start, 'UTC')}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${WEEKDAY_CODES[start.day()]}`
}

const START_RETRO = `
  mutation StartRetro($teamId: ID!, $rrule: RRule) {
    startRetrospective(teamId: $teamId, rrule: $rrule) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on StartRetrospectiveSuccess {
        meeting {
          id
          meetingSeries {
            id
          }
        }
      }
    }
  }
`

const UPDATE_MEETING_TEMPLATE = `
  mutation UpdateMeetingTemplate($meetingId: ID!, $templateId: ID!, $applyToSeries: Boolean) {
    updateMeetingTemplate(meetingId: $meetingId, templateId: $templateId, applyToSeries: $applyToSeries) {
      meeting {
        id
      }
    }
  }
`

const END_RETRO = `
  mutation EndRetro($meetingId: ID!) {
    endRetrospective(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
`

const START_SERIES_NOW = `
  mutation StartMeetingSeriesNow($meetingSeriesId: ID!) {
    startMeetingSeriesNow(meetingSeriesId: $meetingSeriesId) {
      meeting {
        id
        ... on RetrospectiveMeeting {
          templateId
        }
      }
    }
  }
`

test('a recurring retro changes its series template only when asked, and the next retro uses it', async () => {
  const owner = await signUp()
  const auth = {cookie: owner.cookie}
  const started = await sendPublic({
    query: START_RETRO,
    variables: {teamId: owner.teamId, rrule: immediateRrule()},
    ...auth
  })
  expect(started.errors).toBeUndefined()
  const {meeting} = started.data.startRetrospective
  const seriesId = MeetingSeriesId.split(meeting.meetingSeries.id)
  const seriesTemplateId = async () =>
    (
      await getKysely()
        .selectFrom('MeetingSeries')
        .select('templateId')
        .where('id', '=', seriesId)
        .executeTakeFirstOrThrow()
    ).templateId
  const originalTemplateId = await seriesTemplateId()

  const thisMeetingOnly = await sendPublic({
    query: UPDATE_MEETING_TEMPLATE,
    variables: {meetingId: meeting.id, templateId: 'speedCarTemplate'},
    ...auth
  })
  expect(thisMeetingOnly.errors).toBeUndefined()
  expect(await seriesTemplateId()).toBe(originalTemplateId)

  const forward = await sendPublic({
    query: UPDATE_MEETING_TEMPLATE,
    variables: {meetingId: meeting.id, templateId: 'safariPremortemTemplate', applyToSeries: true},
    ...auth
  })
  expect(forward.errors).toBeUndefined()
  expect(await seriesTemplateId()).toBe('safariPremortemTemplate')

  await sendPublic({
    query: UPDATE_MEETING_TEMPLATE,
    variables: {meetingId: meeting.id, templateId: 'speedCarTemplate'},
    ...auth
  })
  const ended = await sendPublic({query: END_RETRO, variables: {meetingId: meeting.id}, ...auth})
  expect(ended.errors).toBeUndefined()
  const next = await sendPublic({
    query: START_SERIES_NOW,
    variables: {meetingSeriesId: meeting.meetingSeries.id},
    ...auth
  })
  expect(next.errors).toBeUndefined()
  expect(next.data.startMeetingSeriesNow.meeting.templateId).toBe('safariPremortemTemplate')
})
