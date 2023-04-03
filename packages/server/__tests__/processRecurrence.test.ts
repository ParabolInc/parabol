import ms from 'ms'
import {RRule} from 'rrule'
import getRethink from '../database/rethinkDriver'
import MeetingTeamPrompt from '../database/types/MeetingTeamPrompt'
import TeamPromptResponsesPhase from '../database/types/TeamPromptResponsesPhase'
import generateUID from '../generateUID'
import {insertMeetingSeries as insertMeetingSeriesQuery} from '../postgres/queries/insertMeetingSeries'
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

// :TODO: (jmtaber129): Handle cleanup better

beforeEach(async () => {
  // Process recurrence right before each test to prevent pending effects (i.e. meetings that will
  // start or end on the next processRecurrence run) from interfering with test results.
  await sendIntranet({
    query: PROCESS_RECURRENCE,
    isPrivate: true
  })
})

test('Should not end meetings that are not scheduled to end', async () => {
  const r = await getRethink()
  const {userId} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase(['foobar'])],
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
  const {userId} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase(['foobar'])],
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
  const {userId} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  const meetingId = generateUID()
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount: 0,
    phases: [new TeamPromptResponsesPhase(['foobar'])],
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
})

test('Should end the current meeting and start a new meeting', async () => {
  const r = await getRethink()
  const {userId} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  const now = new Date()

  // Create a meeting series that's been going on for a few days, and happens daily at 9a UTC.
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2, 9)
  )
  const recurrenceRule = new RRule({
    freq: RRule.DAILY,
    dtstart: startDate
  })

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
    phases: [new TeamPromptResponsesPhase(['foobar'])],
    facilitatorUserId: userId,
    meetingPrompt: 'What are you working on today? Stuck on anything?',
    scheduledEndTime: new Date(Date.now() - ms('5m')),
    meetingSeriesId: newMeetingSeriesId
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
    .filter({meetingType: 'teamPrompt', meetingSeriesId: newMeetingSeriesId})
    .orderBy(r.desc('createdAt'))
    .nth(0)
    .run()

  expect(lastMeeting).toMatchObject({
    name: expect.stringMatching(/Daily Test Standup.*/)
  })
})

test('Should only start a new meeting if it would still be active', async () => {
  const r = await getRethink()
  const {userId} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  const now = new Date()

  // Create a meeting series that's been going on for a few days, and happens daily at 9a UTC.
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 5, 9)
  )
  const recurrenceRule = new RRule({
    freq: RRule.DAILY,
    dtstart: startDate
  })

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
    phases: [new TeamPromptResponsesPhase(['foobar'])],
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
})

test('Should not start a new meeting if the rrule has not started', async () => {
  const r = await getRethink()
  const {userId} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  const now = new Date()

  // Create a meeting series that starts tomorrow, and happens daily at 9a UTC.
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 9)
  )
  const recurrenceRule = new RRule({
    freq: RRule.DAILY,
    dtstart: startDate
  })

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
    phases: [new TeamPromptResponsesPhase(['foobar'])],
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
  const {userId} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  const now = new Date()

  // Create a meeting series that's been going on for a few days, and happens daily at 9a UTC.
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2, 9)
  )
  const recurrenceRule = new RRule({
    freq: RRule.WEEKLY,
    tzid: 'America/Los_Angeles',
    interval: NaN,
    dtstart: startDate
  })

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
    phases: [new TeamPromptResponsesPhase(['foobar'])],
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
