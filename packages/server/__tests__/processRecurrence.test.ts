import dayjs from 'dayjs'
import ms from 'ms'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {toDateTime} from '../../client/shared/rruleUtil'
import DiscussPhase from '../database/types/DiscussPhase'
import ReflectPhase from '../database/types/ReflectPhase'
import TeamPromptResponsesPhase from '../database/types/TeamPromptResponsesPhase'
import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
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
    query: PROCESS_RECURRENCE
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
    query: PROCESS_RECURRENCE
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
    query: PROCESS_RECURRENCE
  })
})

// TODO all these tests regularly timeout or the tests influence each other
test.skip('Should not end meetings that are not scheduled to end', async () => {
  const pg = getKysely()

  const meetingId = generateUID()
  const phase = new TeamPromptResponsesPhase([teamMemberId])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: userId,
      meetingPrompt: 'What are you working on today? Stuck on anything?',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      facilitatorStageId: phase.stages[0]?.id
    })
    .execute()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE
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

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeFalsy()
})

// TODO s.a.
test.skip('Should not end meetings that are scheduled to end in the future', async () => {
  const pg = getKysely()

  const meetingId = generateUID()
  const phase = new TeamPromptResponsesPhase([teamMemberId])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: userId,
      meetingPrompt: 'What are you working on today? Stuck on anything?',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      scheduledEndTime: new Date(Date.now() + ms('5m')),
      facilitatorStageId: phase.stages[0]?.id
    })
    .execute()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE
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

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeFalsy()
  await pg.deleteFrom('NewMeeting').where('id', '=', meetingId).execute()
})

// TODO s.a.
test.skip('Should end meetings that are scheduled to end in the past', async () => {
  const pg = getKysely()

  const meetingId = generateUID()
  const phase = new TeamPromptResponsesPhase([teamMemberId])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: userId,
      meetingPrompt: 'What are you working on today? Stuck on anything?',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      scheduledEndTime: new Date(Date.now() - ms('5m')),
      facilitatorStageId: phase.stages[0]?.id
    })
    .execute()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE
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

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeTruthy()
}, 10000)

// TODO s.a.
test.skip('Should end the current team prompt meeting and start a new meeting', async () => {
  const pg = getKysely()
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
  const phase = new TeamPromptResponsesPhase([teamMemberId])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: userId,
      meetingPrompt: 'What are you working on today? Stuck on anything?',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      scheduledEndTime: new Date(Date.now() - ms('5m')),
      facilitatorStageId: phase.stages[0]?.id,
      meetingSeriesId,
      // The last meeting in the series was created just over 24h ago, so the next one should start
      // soon.
      createdAt: new Date(Date.now() - ms('25h'))
    })
    .execute()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE
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

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeTruthy()

  const lastMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('meetingType', '=', 'teamPrompt')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .executeTakeFirst()

  expect(lastMeeting).toMatchObject({
    name: expect.stringMatching(/Daily Test Standup.*/),
    meetingSeriesId
  })
})

// TODO s.a.
test.skip('Should end the current retro meeting and start a new meeting', async () => {
  const pg = getKysely()

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
  const phases = [new ReflectPhase(teamId, []), new DiscussPhase(undefined)]
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify(phases),
      facilitatorUserId: userId,
      meetingType: 'retrospective',
      scheduledEndTime: new Date(Date.now() - ms('5m')),
      facilitatorStageId: phases[0]!.stages[0]!.id,
      meetingSeriesId,
      templateId: 'startStopContinueTemplate',
      disableAnonymity: false,
      totalVotes: 5,
      name: '',
      maxVotesPerGroup: 5,
      meetingPrompt: 'What are you working on today? Stuck on anything?',
      // The last meeting in the series was created just over 24h ago, so the next one should start
      // soon.
      createdAt: new Date(Date.now() - ms('25h'))
    })
    .execute()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE
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

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeTruthy()

  const lastMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('meetingType', '=', 'retrospective')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .executeTakeFirst()

  expect(lastMeeting).toMatchObject({
    meetingSeriesId
  })
})

// TODO s.a.
test.skip('Should only start a new meeting if it would still be active', async () => {
  const pg = getKysely()

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
  const phase = new TeamPromptResponsesPhase([teamMemberId])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: userId,
      meetingPrompt: 'What are you working on today? Stuck on anything?',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      facilitatorStageId: phase.stages[0]?.id,
      scheduledEndTime: new Date(Date.now() - ms('73h')),
      meetingSeriesId: newMeetingSeriesId,
      // The last meeting in the series was created just over 72h ago, so 3 meetings should have started
      // since then, but only 1 meeting should start as a result of the mutation.
      createdAt: new Date(Date.now() - ms('73h')),
      endedAt: new Date(Date.now() - ms('49h'))
    })
    .execute()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE
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

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeTruthy()
}, 10000)

// TODO s.a.
test.skip('Should not start a new meeting if the rrule has not started', async () => {
  const pg = getKysely()

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
  const phase = new TeamPromptResponsesPhase([teamMemberId])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: userId,
      meetingPrompt: 'What are you working on today? Stuck on anything?',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      facilitatorStageId: phase.stages[0]?.id,
      scheduledEndTime: new Date(Date.now() - ms('1h')),
      meetingSeriesId: newMeetingSeriesId,
      // The last meeting in the series was created just over 24h ago, but the active rrule doesn't
      // start until tomorrow.
      createdAt: new Date(Date.now() - ms('25h')),
      endedAt: new Date(Date.now() - ms('1h'))
    })
    .execute()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE
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

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeTruthy()
})

// TODO s.a.
test.skip('Should not hang if the rrule interval is invalid', async () => {
  const pg = getKysely()

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
  const phase = new TeamPromptResponsesPhase([teamMemberId])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: userId,
      meetingPrompt: 'What are you working on today? Stuck on anything?',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      facilitatorStageId: phase.stages[0]?.id,
      scheduledEndTime: new Date(Date.now() - ms('5m')),
      meetingSeriesId: newMeetingSeriesId,
      // The last meeting in the series was created just over 24h ago, so the next one should start soon
      // but the rrule is invalid, so it won't happen
      createdAt: new Date(Date.now() - ms('25h'))
    })
    .execute()

  const update = await sendIntranet({
    query: PROCESS_RECURRENCE
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

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeTruthy()
})
