import dayjs from 'dayjs'
import ms from 'ms'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {toDateTime} from '../../client/shared/rruleUtil'
import getRethink from '../database/rethinkDriver'
import DiscussPhase from '../database/types/DiscussPhase'
import MeetingRetrospective from '../database/types/MeetingRetrospective'
import MeetingTeamPrompt from '../database/types/MeetingTeamPrompt'
import ReflectPhase from '../database/types/ReflectPhase'
import TeamPromptResponsesPhase from '../database/types/TeamPromptResponsesPhase'
import generateUID from '../generateUID'
import {insertMeetingSeries as insertMeetingSeriesQuery} from '../postgres/queries/insertMeetingSeries'
import {RetroMeetingPhase} from '../postgres/types/NewMeetingPhase'
import {getUserTeams, sendIntranet, signUp} from './common'

const PROCESS_RECURRENCE = `
  mutation {
    processRecurrence {
      ... on ProcessRecurrenceSuccess {
        meetingsStarted
        meetingsEnded
      }
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
`

const assertIdempotency = async () => {
  // Assert that subsequent mutations do nothing.
  let res = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(res).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 0,
        meetingsEnded: 0
      }
    }
  })

  res = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(res).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 0,
        meetingsEnded: 0
      }
    }
  })
}

let userId: string
let teamId: string
let teamMemberId: string

beforeAll(async () => {
  userId = (await signUp()).userId
  teamId = (await getUserTeams(userId))[0].id
  teamMemberId = TeamMemberId.join(teamId, userId)

  // in case there are pending recurrence events
  await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })
})

test('Should not end meetings that are not scheduled to end', async () => {
  const r = await getRethink()

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase([teamMemberId])],
    facilitatorUserId: userId,
    meetingPrompt: 'What are you working on today? Stuck on anything?'
  })

  await r.table('NewMeeting').insert(meeting).run()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(update).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 0,
        meetingsEnded: 0
      }
    }
  })

  await assertIdempotency()

  const actualMeeting = await r.table('NewMeeting').get(meetingId).run()
  expect(actualMeeting.endedAt).toBeFalsy()
})

test('Should not end meetings that are scheduled to end in the future', async () => {
  const r = await getRethink()

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase([teamMemberId])],
    facilitatorUserId: userId,
    meetingPrompt: 'What are you working on today? Stuck on anything?',
    scheduledEndTime: new Date(Date.now() + ms('5m'))
  })

  await r.table('NewMeeting').insert(meeting).run()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(update).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 0,
        meetingsEnded: 0
      }
    }
  })

  await assertIdempotency()

  const actualMeeting = await r.table('NewMeeting').get(meetingId).run()
  expect(actualMeeting.endedAt).toBeFalsy()

  await r.table('NewMeeting').get(meetingId).delete().run()
})

test('Should end meetings that are scheduled to end in the past', async () => {
  const r = await getRethink()

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase([teamMemberId])],
    facilitatorUserId: userId,
    meetingPrompt: 'What are you working on today? Stuck on anything?',
    scheduledEndTime: new Date(Date.now() - ms('5m'))
  })

  await r.table('NewMeeting').insert(meeting).run()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(update).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 0,
        meetingsEnded: 1
      }
    }
  })

  await assertIdempotency()

  const actualMeeting = await r.table('NewMeeting').get(meetingId).run()
  expect(actualMeeting.endedAt).toBeTruthy()
}, 10000)

test('Should end the current team prompt meeting and start a new meeting', async () => {
  const r = await getRethink()
  const startDate = dayjs().utc().subtract(2, 'day').set('hour', 9)
  const dateTime = toDateTime(startDate, 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU`

  const meetingSeriesId = await insertMeetingSeriesQuery({
    meetingType: 'teamPrompt',
    title: 'Daily Test Standup',
    recurrenceRule,
    duration: 24 * 60, // 24 hours
    teamId,
    facilitatorId: userId
  })

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase([teamMemberId])],
    facilitatorUserId: userId,
    meetingPrompt: 'What are you working on today? Stuck on anything?',
    scheduledEndTime: new Date(Date.now() - ms('5m')),
    meetingSeriesId
  })

  // The last meeting in the series was created just over 24h ago, so the next one should start
  // soon.
  meeting.createdAt = new Date(meeting.createdAt.getTime() - ms('25h'))

  await r.table('NewMeeting').insert(meeting).run()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(update).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 1,
        meetingsEnded: 1
      }
    }
  })

  await assertIdempotency()

  const actualMeeting = await r.table('NewMeeting').get(meetingId).run()
  expect(actualMeeting.endedAt).toBeTruthy()

  const lastMeeting = await r
    .table('NewMeeting')
    .filter({meetingType: 'teamPrompt', meetingSeriesId})
    .orderBy(r.desc('createdAt'))
    .nth(0)
    .run()

  expect(lastMeeting).toMatchObject({
    name: expect.stringMatching(/Daily Test Standup.*/),
    meetingSeriesId
  })
})

test('Should end the current retro meeting and start a new meeting', async () => {
  const r = await getRethink()

  // Create a meeting series that's been going on for a few days, and happens daily at 9a UTC.
  const startDate = dayjs().utc().subtract(2, 'day').set('hour', 9)
  const dateTime = toDateTime(startDate, 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU`

  const meetingSeriesId = await insertMeetingSeriesQuery({
    meetingType: 'retrospective',
    title: 'Daily Retro', //they're really committed to improving
    recurrenceRule,
    duration: 24 * 60, // 24 hours
    teamId,
    facilitatorId: userId
  })

  const meetingId = generateUID()
  const meeting = new MeetingRetrospective({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [
      new ReflectPhase(teamId, []) as RetroMeetingPhase,
      new DiscussPhase(undefined) as RetroMeetingPhase
    ],
    facilitatorUserId: userId,
    scheduledEndTime: new Date(Date.now() - ms('5m')),
    meetingSeriesId,
    templateId: 'startStopContinueTemplate',
    disableAnonymity: false,
    totalVotes: 5,
    name: '',
    maxVotesPerGroup: 5
  })

  // The last meeting in the series was created just over 24h ago, so the next one should start
  // soon.
  meeting.createdAt = new Date(meeting.createdAt.getTime() - ms('25h'))

  await r.table('NewMeeting').insert(meeting).run()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(update).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 1,
        meetingsEnded: 1
      }
    }
  })

  await assertIdempotency()

  const actualMeeting = await r.table('NewMeeting').get(meetingId).run()
  expect(actualMeeting.endedAt).toBeTruthy()

  const lastMeeting = await r
    .table('NewMeeting')
    .filter({meetingType: 'retrospective', meetingSeriesId})
    .orderBy(r.desc('createdAt'))
    .nth(0)
    .run()

  expect(lastMeeting).toMatchObject({
    meetingSeriesId
  })
})

test('Should only start a new meeting if it would still be active', async () => {
  const r = await getRethink()

  const startDate = dayjs().utc().subtract(2, 'day').set('hour', 9)
  const dateTime = toDateTime(startDate, 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU`

  const newMeetingSeriesId = await insertMeetingSeriesQuery({
    meetingType: 'teamPrompt',
    title: 'Async Standup',
    recurrenceRule,
    duration: 24 * 60, // 24 hours
    teamId,
    facilitatorId: userId
  })

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase([teamMemberId])],
    facilitatorUserId: userId,
    meetingPrompt: 'What are you working on today? Stuck on anything?',
    scheduledEndTime: new Date(Date.now() - ms('73h')),
    meetingSeriesId: newMeetingSeriesId
  })

  // The last meeting in the series was created just over 72h ago, so 3 meetings should have started
  // since then, but only 1 meeting should start as a result of the mutation.
  meeting.createdAt = new Date(meeting.createdAt.getTime() - ms('73h'))
  meeting.endedAt = new Date(Date.now() - ms('49h'))

  await r.table('NewMeeting').insert(meeting).run()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(update).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 1,
        meetingsEnded: 0
      }
    }
  })

  await assertIdempotency()

  const actualMeeting = await r.table('NewMeeting').get(meetingId).run()
  expect(actualMeeting.endedAt).toBeTruthy()
}, 10000)

test('Should not start a new meeting if the rrule has not started', async () => {
  const r = await getRethink()

  const startDate = dayjs().utc().add(1, 'day').set('hour', 9)
  const dateTime = toDateTime(startDate, 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU`

  const newMeetingSeriesId = await insertMeetingSeriesQuery({
    meetingType: 'teamPrompt',
    title: 'Async Standup',
    recurrenceRule: recurrenceRule.toString(),
    duration: 24 * 60, // 24 hours
    teamId,
    facilitatorId: userId
  })

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase([teamMemberId])],
    facilitatorUserId: userId,
    meetingPrompt: 'What are you working on today? Stuck on anything?',
    scheduledEndTime: new Date(Date.now() - ms('1h')),
    meetingSeriesId: newMeetingSeriesId
  })

  // The last meeting in the series was created just over 24h ago, but the active rrule doesn't
  // start until tomorrow.
  meeting.createdAt = new Date(meeting.createdAt.getTime() - ms('25h'))
  meeting.endedAt = new Date(Date.now() - ms('1h'))

  await r.table('NewMeeting').insert(meeting).run()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(update).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 0,
        meetingsEnded: 0
      }
    }
  })

  await assertIdempotency()

  const actualMeeting = await r.table('NewMeeting').get(meetingId).run()
  expect(actualMeeting.endedAt).toBeTruthy()
})

test('Should not hang if the rrule interval is invalid', async () => {
  const r = await getRethink()

  const startDate = dayjs().utc().subtract(2, 'day').set('hour', 9)
  const dateTime = toDateTime(startDate, 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=NaN;BYDAY=MO,TU,WE,TH,FR,SA,SU`

  const newMeetingSeriesId = await insertMeetingSeriesQuery({
    meetingType: 'teamPrompt',
    title: 'Daily Test Standup',
    recurrenceRule: recurrenceRule.toString(),
    duration: 24 * 60, // 24 hours
    teamId,
    facilitatorId: userId
  })

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase([teamMemberId])],
    facilitatorUserId: userId,
    meetingPrompt: 'What are you working on today? Stuck on anything?',
    scheduledEndTime: new Date(Date.now() - ms('5m')),
    meetingSeriesId: newMeetingSeriesId
  })

  // The last meeting in the series was created just over 24h ago, so the next one should start soon
  // but the rrule is invalid, so it won't happen
  meeting.createdAt = new Date(meeting.createdAt.getTime() - ms('25h'))

  await r.table('NewMeeting').insert(meeting).run()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })

  expect(update).toEqual({
    data: {
      processRecurrence: {
        meetingsStarted: 0,
        meetingsEnded: 1
      }
    }
  })

  await assertIdempotency()

  const actualMeeting = await r.table('NewMeeting').get(meetingId).run()
  expect(actualMeeting.endedAt).toBeTruthy()
})
