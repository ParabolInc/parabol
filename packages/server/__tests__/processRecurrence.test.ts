import dayjs from 'dayjs'
import ms from 'ms'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {toDateTime} from '../../client/shared/rruleUtil'
import DiscussPhase from '../database/types/DiscussPhase'
import ReflectPhase from '../database/types/ReflectPhase'
import TeamPromptResponsesPhase from '../database/types/TeamPromptResponsesPhase'
import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
import {getUserTeams, processRecurrence, signUp} from './common'

// processRecurrence handles every due series in the database, including other suites', so its
// counts can't be asserted. These tests check their own team's meetings instead.
const selectTeamMeetings = () =>
  getKysely()
    .selectFrom('NewMeeting')
    .select(['id', 'endedAt'])
    .where('teamId', '=', teamId)
    .orderBy('id')
    .execute()

const selectSeriesMeetings = (meetingSeriesId: number) =>
  getKysely()
    .selectFrom('NewMeeting')
    .selectAll()
    .where('meetingSeriesId', '=', meetingSeriesId)
    .orderBy('createdAt')
    .execute()

const runProcessRecurrence = async () => {
  const res = await processRecurrence()
  expect(res.data.processRecurrence.error).toBeUndefined()
}

const assertIdempotency = async () => {
  // Assert that subsequent mutations do nothing.
  const meetings = await selectTeamMeetings()
  await runProcessRecurrence()
  await runProcessRecurrence()
  expect(await selectTeamMeetings()).toEqual(meetings)
}

let userId: string
let teamId: string
let teamMemberId: string

beforeAll(async () => {
  userId = (await signUp()).userId
  teamId = (await getUserTeams(userId))[0].id
  teamMemberId = TeamMemberId.join(teamId, userId)
})

test('Should not end meetings that are not scheduled to end', async () => {
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
      templateId: 'teamPrompt',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      facilitatorStageId: phase.stages[0]?.id
    })
    .execute()

  await runProcessRecurrence()
  await assertIdempotency()

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeFalsy()
})

test('Should not end meetings that are scheduled to end in the future', async () => {
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
      templateId: 'teamPrompt',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      scheduledEndTime: new Date(Date.now() + ms('5m')),
      facilitatorStageId: phase.stages[0]?.id
    })
    .execute()

  await runProcessRecurrence()
  await assertIdempotency()

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeFalsy()
  await pg.deleteFrom('NewMeeting').where('id', '=', meetingId).execute()
})

test('Should end meetings that are scheduled to end in the past', async () => {
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
      templateId: 'teamPrompt',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      scheduledEndTime: new Date(Date.now() - ms('5m')),
      facilitatorStageId: phase.stages[0]?.id
    })
    .execute()

  await runProcessRecurrence()
  await assertIdempotency()

  const actualMeeting = await pg
    .selectFrom('NewMeeting')
    .selectAll()
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  expect(actualMeeting.endedAt).toBeTruthy()
}, 10000)

test('Should end the current team prompt meeting and start a new meeting', async () => {
  const pg = getKysely()
  // A daily series whose latest occurrence was 5 minutes ago. The last meeting started on the
  // occurrence before it & was scheduled to run until it.
  const latestOccurrence = dayjs().utc().subtract(5, 'minute').startOf('minute')
  const dateTime = toDateTime(latestOccurrence.subtract(2, 'day'), 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU`
  const meetingSeries = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamPrompt',
      title: 'Daily Test Standup',
      recurrenceRule,
      duration: 24 * 60, // 24 hours
      teamId,
      facilitatorId: userId
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  const meetingSeriesId = meetingSeries.id
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
      templateId: 'teamPrompt',
      name: `Team Prompt #1`,
      meetingType: 'teamPrompt',
      scheduledEndTime: latestOccurrence.toDate(),
      facilitatorStageId: phase.stages[0]?.id,
      meetingSeriesId,
      createdAt: latestOccurrence.subtract(1, 'day').toDate()
    })
    .execute()

  await runProcessRecurrence()
  await assertIdempotency()

  expect(await selectSeriesMeetings(meetingSeriesId)).toMatchObject([
    {id: meetingId, endedAt: expect.any(Date)},
    {name: expect.stringMatching(/Daily Test Standup.*/), endedAt: null}
  ])
})

test('Should end the current retro meeting and start a new meeting', async () => {
  const pg = getKysely()

  // A daily series whose latest occurrence was 5 minutes ago. The last meeting started on the
  // occurrence before it & was scheduled to run until it.
  const latestOccurrence = dayjs().utc().subtract(5, 'minute').startOf('minute')
  const dateTime = toDateTime(latestOccurrence.subtract(2, 'day'), 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU`

  const meetingSeries = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'retrospective',
      title: 'Daily Retro', //they're really committed to improving
      recurrenceRule,
      duration: 24 * 60, // 24 hours
      teamId,
      facilitatorId: userId
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  const meetingSeriesId = meetingSeries.id

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
      scheduledEndTime: latestOccurrence.toDate(),
      facilitatorStageId: phases[0]!.stages[0]!.id,
      meetingSeriesId,
      templateId: 'startStopContinueTemplate',
      disableAnonymity: false,
      totalVotes: 5,
      name: '',
      maxVotesPerGroup: 5,
      meetingPrompt: 'What are you working on today? Stuck on anything?',
      createdAt: latestOccurrence.subtract(1, 'day').toDate()
    })
    .execute()

  await runProcessRecurrence()
  await assertIdempotency()

  expect(await selectSeriesMeetings(meetingSeriesId)).toMatchObject([
    {id: meetingId, endedAt: expect.any(Date)},
    {endedAt: null}
  ])
})

test('Should only start a new meeting if it would still be active', async () => {
  const pg = getKysely()

  const startDate = dayjs().utc().subtract(2, 'day').set('hour', 9)
  const dateTime = toDateTime(startDate, 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU`

  const newMeetingSeries = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamPrompt',
      title: 'Async Standup',
      recurrenceRule,
      duration: 24 * 60, // 24 hours
      teamId,
      facilitatorId: userId
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  const newMeetingSeriesId = newMeetingSeries.id

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
      templateId: 'teamPrompt',
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

  await runProcessRecurrence()
  await assertIdempotency()

  expect(await selectSeriesMeetings(newMeetingSeriesId)).toMatchObject([
    {id: meetingId, endedAt: expect.any(Date)},
    {endedAt: null}
  ])
}, 10000)

test('Should not start a new meeting if the rrule has not started', async () => {
  const pg = getKysely()

  const startDate = dayjs().utc().add(1, 'day').set('hour', 9)
  const dateTime = toDateTime(startDate, 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU`

  const newMeetingSeries = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamPrompt',
      title: 'Async Standup',
      recurrenceRule: recurrenceRule.toString(),
      duration: 24 * 60, // 24 hours
      teamId,
      facilitatorId: userId
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  const newMeetingSeriesId = newMeetingSeries.id

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
      templateId: 'teamPrompt',
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

  await runProcessRecurrence()
  await assertIdempotency()

  expect(await selectSeriesMeetings(newMeetingSeriesId)).toMatchObject([
    {id: meetingId, endedAt: expect.any(Date)}
  ])
})

test('Should not hang if the rrule interval is invalid', async () => {
  const pg = getKysely()

  const startDate = dayjs().utc().subtract(2, 'day').set('hour', 9)
  const dateTime = toDateTime(startDate, 'UTC')
  const recurrenceRule = `DTSTART:${dateTime}
RRULE:FREQ=WEEKLY;INTERVAL=NaN;BYDAY=MO,TU,WE,TH,FR,SA,SU`

  const newMeetingSeries = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamPrompt',
      title: 'Daily Test Standup',
      recurrenceRule: recurrenceRule.toString(),
      duration: 24 * 60, // 24 hours
      teamId,
      facilitatorId: userId
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  const newMeetingSeriesId = newMeetingSeries.id

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
      templateId: 'teamPrompt',
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

  await runProcessRecurrence()
  await assertIdempotency()

  expect(await selectSeriesMeetings(newMeetingSeriesId)).toMatchObject([
    {id: meetingId, endedAt: expect.any(Date)}
  ])
})
