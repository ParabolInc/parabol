import {randomUUIDv7} from 'crypto'
import dayjs from 'dayjs'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {toDateTime} from '../../client/shared/rruleUtil'
import getKysely from '../postgres/getKysely'
import {processRecurrence, signUp} from './common'

// starts two days ago & recurs daily, so an occurrence is always due
const dueRecurrenceRule = () => {
  const startDate = dayjs().utc().subtract(2, 'day').set('hour', 9)
  return `DTSTART:${toDateTime(startDate, 'UTC')}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU`
}

const addTeamMember = async (teamId: string, userId: string, isLead: boolean) => {
  await getKysely()
    .insertInto('TeamMember')
    .values({id: TeamMemberId.join(teamId, userId), teamId, userId, isLead})
    .execute()
}

// A parallel suite's processRecurrence can start the series as soon as it exists, so each test
// creates it last, once the team is in the state under test
const createSeries = async (teamId: string, facilitatorId: string) => {
  return getKysely()
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamPrompt',
      title: 'Daily Standup',
      recurrenceRule: dueRecurrenceRule(),
      duration: 24 * 60,
      teamId,
      facilitatorId,
      // backdated so the rrule has an unused occurrence between creation & now
      createdAt: dayjs().utc().subtract(25, 'hour').toDate()
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

const selectSeries = async (id: number) =>
  getKysely()
    .selectFrom('MeetingSeries')
    .select(['facilitatorId', 'cancelledAt'])
    .where('id', '=', id)
    .executeTakeFirstOrThrow()

// Regression: one person leaving used to cancel the whole team's recurring meeting.
test('a removed facilitator hands the series to the team lead instead of ending it', async () => {
  const pg = getKysely()
  const lead = await signUp()
  const facilitator = await signUp()
  await addTeamMember(lead.teamId, facilitator.userId, false)

  // the facilitator leaves the team
  await pg
    .updateTable('TeamMember')
    .set({isNotRemoved: false})
    .where('id', '=', TeamMemberId.join(lead.teamId, facilitator.userId))
    .execute()
  const series = await createSeries(lead.teamId, facilitator.userId)

  await processRecurrence()

  const after = await selectSeries(series.id)
  expect(after.cancelledAt).toBeNull()
  expect(after.facilitatorId).toBe(lead.userId)

  const meeting = await pg
    .selectFrom('NewMeeting')
    .select(['id', 'facilitatorUserId'])
    .where('meetingSeriesId', '=', series.id)
    .executeTakeFirst()
  expect(meeting).toBeTruthy()
  expect(meeting!.facilitatorUserId).toBe(lead.userId)
})

// A hard-deleted account cascades its TeamMember row away. loadNonNull used to throw here, which
// Promise.allSettled swallowed, so the series silently never recurred again.
test('a facilitator whose team member row is gone does not stall the series', async () => {
  const pg = getKysely()
  const lead = await signUp()
  const facilitator = await signUp()
  await addTeamMember(lead.teamId, facilitator.userId, false)

  await pg
    .deleteFrom('TeamMember')
    .where('id', '=', TeamMemberId.join(lead.teamId, facilitator.userId))
    .execute()
  const series = await createSeries(lead.teamId, facilitator.userId)

  const res = await processRecurrence()
  expect(res.data.processRecurrence.error).toBeUndefined()

  const after = await selectSeries(series.id)
  expect(after.cancelledAt).toBeNull()
  expect(after.facilitatorId).toBe(lead.userId)
})

test('a series whose team has nobody left is cancelled', async () => {
  const pg = getKysely()
  const owner = await signUp()
  const teamId = randomUUIDv7()
  await pg
    .insertInto('Team')
    .values({id: teamId, name: `Abandoned ${teamId}`, orgId: owner.orgId})
    .execute()
  await addTeamMember(teamId, owner.userId, true)

  // every member leaves, so there is no successor to hand it to
  await pg
    .updateTable('TeamMember')
    .set({isNotRemoved: false})
    .where('teamId', '=', teamId)
    .execute()
  const series = await createSeries(teamId, owner.userId)

  await processRecurrence()

  const after = await selectSeries(series.id)
  expect(after.cancelledAt).not.toBeNull()
})
