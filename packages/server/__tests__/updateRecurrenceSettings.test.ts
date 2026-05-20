import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import TeamPromptResponsesPhase from '../database/types/TeamPromptResponsesPhase'
import generateUID from '../generateUID'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const UPDATE_RECURRENCE_SETTINGS = `
  mutation UpdateRecurrenceSettings($meetingId: ID!, $name: String, $rrule: RRule) {
    updateRecurrenceSettings(meetingId: $meetingId, name: $name, rrule: $rrule) {
      ... on ErrorPayload {
        error { message }
      }
      ... on UpdateRecurrenceSettingsSuccess {
        meeting { id }
      }
    }
  }
`

const ORIGINAL_RRULE = `DTSTART;TZID=America/Toronto:20260520T070000
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR`

const NEW_RRULE = `DTSTART;TZID=America/Toronto:20260520T160000
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR`

// Regression test for the bug where updateRecurrenceSettings silently no-op'd on an
// active MeetingSeries. Kysely 0.28's `.where(col, '=', null)` compiles to literal
// `WHERE col = $N` with $N=null — always UNKNOWN under SQL three-valued logic, so the
// UPDATE matched zero rows for every uncancelled series. The fix uses `'is', null`.
test('updateRecurrenceSettings updates the rrule of an active (non-cancelled) MeetingSeries', async () => {
  const pg = getKysely()
  const {userId, teamId, cookie} = await signUp()

  const meetingSeries = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamPrompt',
      title: 'Regression Standup',
      recurrenceRule: ORIGINAL_RRULE,
      duration: 24 * 60,
      teamId,
      facilitatorId: userId
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const meetingId = generateUID()
  const phase = new TeamPromptResponsesPhase([TeamMemberId.join(teamId, userId)])
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      meetingCount: 0,
      meetingNumber: 1,
      phases: JSON.stringify([phase]),
      facilitatorUserId: userId,
      meetingPrompt: 'What are you working on today?',
      name: 'Regression Standup #1',
      meetingType: 'teamPrompt',
      facilitatorStageId: phase.stages[0]?.id,
      meetingSeriesId: meetingSeries.id
    })
    .execute()

  const res = await sendPublic({
    query: UPDATE_RECURRENCE_SETTINGS,
    variables: {meetingId, name: 'Regression Standup', rrule: NEW_RRULE},
    cookie
  })

  expect(res.data.updateRecurrenceSettings.error).toBeUndefined()

  const after = await pg
    .selectFrom('MeetingSeries')
    .select(['recurrenceRule', 'cancelledAt'])
    .where('id', '=', meetingSeries.id)
    .executeTakeFirstOrThrow()

  expect(after.cancelledAt).toBeNull()
  // before the fix the row didn't change at all; assert both directions so it can't sneak back in
  expect(after.recurrenceRule).not.toBe(ORIGINAL_RRULE)
  expect(after.recurrenceRule).toMatch(/T160000/)
})
