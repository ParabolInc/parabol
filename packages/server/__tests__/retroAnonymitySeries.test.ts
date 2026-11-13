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
            recurrenceRule
            disableAnonymity
          }
        }
      }
    }
  }
`

const START_TEAM_PROMPT = `
  mutation StartTeamPrompt($teamId: ID!, $rrule: RRule) {
    startTeamPrompt(teamId: $teamId, rrule: $rrule) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on StartTeamPromptSuccess {
        meetingSeries {
          id
          recurrenceRule
          disableAnonymity
        }
      }
    }
  }
`

const UPDATE_MEETING_SERIES = `
  mutation UpdateMeetingSeries(
    $meetingSeriesId: ID!
    $name: String
    $rrule: RRule
    $disableAnonymity: Boolean
  ) {
    updateMeetingSeries(
      meetingSeriesId: $meetingSeriesId
      name: $name
      rrule: $rrule
      disableAnonymity: $disableAnonymity
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on UpdateMeetingSeriesSuccess {
        meetingSeries {
          id
          disableAnonymity
        }
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
          disableAnonymity
        }
      }
    }
  }
`

const selectSeriesDisableAnonymity = async (meetingSeriesId: string) =>
  (
    await getKysely()
      .selectFrom('MeetingSeries')
      .select('disableAnonymity')
      .where('id', '=', MeetingSeriesId.split(meetingSeriesId))
      .executeTakeFirstOrThrow()
  ).disableAnonymity

test('a recurring retro turns off anonymity for its upcoming meetings, not the one in progress', async () => {
  const owner = await signUp()
  const auth = {cookie: owner.cookie}
  const started = await sendPublic({
    query: START_RETRO,
    variables: {teamId: owner.teamId, rrule: immediateRrule()},
    ...auth
  })
  expect(started.errors).toBeUndefined()
  const {meeting} = started.data.startRetrospective
  const {meetingSeries} = meeting
  expect(meetingSeries.disableAnonymity).toBe(false)
  expect(await selectSeriesDisableAnonymity(meetingSeries.id)).toBeNull()

  const renamed = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {
      meetingSeriesId: meetingSeries.id,
      name: 'Weekly Retro',
      rrule: meetingSeries.recurrenceRule
    },
    ...auth
  })
  expect(renamed.errors).toBeUndefined()
  expect(renamed.data.updateMeetingSeries.error).toBeUndefined()
  expect(await selectSeriesDisableAnonymity(meetingSeries.id)).toBeNull()

  const updated = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {
      meetingSeriesId: meetingSeries.id,
      rrule: meetingSeries.recurrenceRule,
      disableAnonymity: true
    },
    ...auth
  })
  expect(updated.errors).toBeUndefined()
  expect(updated.data.updateMeetingSeries.meetingSeries.disableAnonymity).toBe(true)
  expect(await selectSeriesDisableAnonymity(meetingSeries.id)).toBe(true)

  const inProgress = await getKysely()
    .selectFrom('NewMeeting')
    .select('disableAnonymity')
    .where('id', '=', meeting.id)
    .executeTakeFirstOrThrow()
  expect(inProgress.disableAnonymity).toBe(false)

  const ended = await sendPublic({query: END_RETRO, variables: {meetingId: meeting.id}, ...auth})
  expect(ended.errors).toBeUndefined()
  const next = await sendPublic({
    query: START_SERIES_NOW,
    variables: {meetingSeriesId: meetingSeries.id},
    ...auth
  })
  expect(next.errors).toBeUndefined()
  expect(next.data.startMeetingSeriesNow.meeting.disableAnonymity).toBe(true)
})

test('only a retrospective series can change its anonymity', async () => {
  const owner = await signUp()
  const auth = {cookie: owner.cookie}
  const started = await sendPublic({
    query: START_TEAM_PROMPT,
    variables: {teamId: owner.teamId, rrule: immediateRrule()},
    ...auth
  })
  expect(started.errors).toBeUndefined()
  const {meetingSeries} = started.data.startTeamPrompt
  expect(meetingSeries.disableAnonymity).toBeNull()

  const updated = await sendPublic({
    query: UPDATE_MEETING_SERIES,
    variables: {
      meetingSeriesId: meetingSeries.id,
      name: 'Daily Standup',
      rrule: meetingSeries.recurrenceRule,
      disableAnonymity: true
    },
    ...auth
  })
  expect(updated.errors[0].message).toBe('Only a retrospective series has anonymous reflections')
  expect(updated.errors[0].extensions.code).toBe('BAD_USER_INPUT')
  const series = await getKysely()
    .selectFrom('MeetingSeries')
    .select(['title', 'disableAnonymity'])
    .where('id', '=', MeetingSeriesId.split(meetingSeries.id))
    .executeTakeFirstOrThrow()
  expect(series.disableAnonymity).toBeNull()
  expect(series.title).not.toBe('Daily Standup')
})
