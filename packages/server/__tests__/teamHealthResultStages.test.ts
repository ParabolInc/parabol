import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const START = `
  mutation StartTeamHealth($teamIds: [ID!]!, $templateId: ID!) {
    startTeamHealth(teamIds: $teamIds, templateId: $templateId) {
      meetings {
        id
        phases {
          phaseType
          stages {
            id
            ... on TeamHealthResponseStage {
              question { id }
            }
            ... on TeamHealthResultStage {
              score
              previousScore
              question { id }
              responses { id }
            }
          }
        }
      }
    }
  }
`

const SPECTATE = `
  mutation SetTeamHealthSpectate($meetingId: ID!, $isSpectating: Boolean!) {
    setTeamHealthSpectate(meetingId: $meetingId, isSpectating: $isSpectating) {
      meetingMember { id }
    }
  }
`

const RESPOND = `
  mutation SetTeamHealthResponse($meetingId: ID!, $stageId: ID!, $score: Int) {
    setTeamHealthResponse(meetingId: $meetingId, stageId: $stageId, score: $score) {
      meetingId
    }
  }
`

const END = `
  mutation EndTeamHealth($meetingId: ID!) {
    endTeamHealth(meetingId: $meetingId) {
      meetingId
    }
  }
`

const MEETING = `
  query TeamHealthResultStages($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        phases {
          phaseType
          stages {
            ... on TeamHealthResultStage {
              score
              previousScore
              question { category { name } }
            }
          }
        }
      }
    }
  }
`

const getStages = (meeting: any, phaseType: string) =>
  meeting.phases.find((phase: any) => phase.phaseType === phaseType).stages

// Answers the prior cycle by cloning the meeting into the same series, ending it, and writing the
// given scores. Recurrence isn't involved, so the series is assembled by hand.
const seedPriorCycle = async (
  meetingId: string,
  teamId: string,
  userId: string,
  scores: (number | null)[]
) => {
  const pg = getKysely()
  const priorMeetingId = `${meetingId}-prior`
  const seriesId = await pg
    .insertInto('MeetingSeries')
    .values({
      id: 900000 + Math.floor(Math.random() * 99999),
      meetingType: 'teamHealth',
      title: 'prior cycle',
      recurrenceRule: 'DTSTART:20260101T000000Z\nRRULE:FREQ=WEEKLY',
      duration: 60,
      teamId,
      facilitatorId: userId
    })
    .returning('id')
    .executeTakeFirstOrThrow()
    .then(({id}) => id)
  await sql`
    INSERT INTO "NewMeeting" (id, "createdAt", "endedAt", "meetingSeriesId", "isLegacy", "createdBy",
      "facilitatorStageId", "facilitatorUserId", "meetingCount", "meetingNumber", "meetingType",
      name, phases, "teamId", "templateId")
    SELECT ${priorMeetingId}, '2026-01-01'::timestamptz, '2026-01-01'::timestamptz, ${seriesId},
      "isLegacy", "createdBy", "facilitatorStageId", "facilitatorUserId", "meetingCount",
      "meetingNumber", "meetingType", name, phases, "teamId", "templateId"
    FROM "NewMeeting" WHERE id = ${meetingId}
  `.execute(pg)
  await pg
    .updateTable('NewMeeting')
    .set({meetingSeriesId: seriesId})
    .where('id', '=', meetingId)
    .execute()
  // the GraphQL question id is ciphered, so read the raw ids off the stored phases
  const {phases} = await pg
    .selectFrom('NewMeeting')
    .select('phases')
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  const questionIds = (phases as any[])
    .find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
    .stages.map((stage: any) => stage.questionId as number)
  for (const [idx, questionId] of questionIds.entries()) {
    const score = scores[idx]
    if (score === null || score === undefined) continue
    await pg
      .insertInto('TeamHealthResponse')
      .values({meetingId: priorMeetingId, questionId, userId, score})
      .execute()
  }
}

test('the result phase holds one stage per category, ordered by urgency once revealed', async () => {
  const {userId, teamId, cookie} = await signUp()

  const start = await sendPublic({
    query: START,
    variables: {teamIds: [teamId], templateId: 'googleProjectAristotleTemplate'},
    cookie
  })
  const meeting = start.data.startTeamHealth.meetings[0]
  const meetingId = meeting.id
  const responseStages = getStages(meeting, 'TEAM_HEALTH_RESPONSE')
  const resultStages = getStages(meeting, 'TEAM_HEALTH_RESULT')

  // one result stage per question, in question order until the reveal reorders them
  expect(resultStages.map((stage: any) => stage.question.id)).toEqual(
    responseStages.map((stage: any) => stage.question.id)
  )
  // every aggregate stays hidden while the meeting is in progress
  expect(resultStages).toEqual(
    resultStages.map(() =>
      expect.objectContaining({score: null, previousScore: null, responses: []})
    )
  )

  // the owner is a spectator by default, so opt in before answering
  await sendPublic({query: SPECTATE, variables: {meetingId, isSpectating: false}, cookie})
  const thisCycle = [3, 1, 2, 5, 4]
  for (const [idx, stage] of responseStages.entries()) {
    await sendPublic({
      query: RESPOND,
      variables: {meetingId, stageId: stage.id, score: thisCycle[idx]},
      cookie
    })
  }
  // deltas of -4 for idx 1 and 0 for idx 3, leaving idx 0, 2 and 4 without a previous cycle
  await seedPriorCycle(meetingId, teamId, userId, [null, 5, null, 5, null])

  await sendPublic({query: END, variables: {meetingId}, cookie})
  const revealed = await sendPublic({query: MEETING, variables: {meetingId}, cookie})
  const revealedStages = getStages(revealed.data.viewer.meeting, 'TEAM_HEALTH_RESULT')

  // categories with no previous cycle lead, lowest score first, then the rest by steepest drop
  expect(revealedStages.map(({score, previousScore}: any) => ({score, previousScore}))).toEqual([
    {score: 2, previousScore: null},
    {score: 3, previousScore: null},
    {score: 4, previousScore: null},
    {score: 1, previousScore: 5},
    {score: 5, previousScore: 5}
  ])
}, 60000)
