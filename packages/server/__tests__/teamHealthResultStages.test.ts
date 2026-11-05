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
              scoreHistory { score }
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
    setTeamHealthResponse(
      meetingId: $meetingId
      stageId: $stageId
      score: $score
      isAnonymous: true
    ) {
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
              scoreHistory { score }
              question { category { name } }
              meeting { id }
              phase { phaseType }
            }
          }
        }
      }
    }
  }
`

const getStages = (meeting: any, phaseType: string) =>
  meeting.phases.find((phase: any) => phase.phaseType === phaseType).stages

const readQuestionIds = async (meetingId: string) => {
  // the GraphQL question id is ciphered, so read the raw ids off the stored phases
  const {phases} = await getKysely()
    .selectFrom('NewMeeting')
    .select('phases')
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  return (phases as any[])
    .find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
    .stages.map((stage: any) => stage.questionId as number)
}

const answer = async (meetingId: string, userId: string, scores: (number | null)[]) => {
  const questionIds = await readQuestionIds(meetingId)
  for (const [idx, questionId] of questionIds.entries()) {
    const score = scores[idx]
    if (score === null || score === undefined) continue
    await getKysely()
      .insertInto('TeamHealthResponse')
      .values({meetingId, questionId, userId, score})
      .execute()
  }
}

// The team's check before this one, cloned from it and ended long ago. History follows the team, so
// no meeting series is needed
const seedPriorCheck = async (meetingId: string, userIds: string[], scores: (number | null)[]) => {
  const pg = getKysely()
  const priorMeetingId = `${meetingId}-prior`
  await sql`
    INSERT INTO "NewMeeting" (id, "createdAt", "endedAt", "isLegacy", "createdBy",
      "facilitatorStageId", "facilitatorUserId", "meetingCount", "meetingNumber", "meetingType",
      name, phases, "teamId", "templateId")
    SELECT ${priorMeetingId}, '2026-01-01'::timestamptz, '2026-01-01'::timestamptz,
      "isLegacy", "createdBy", "facilitatorStageId", "facilitatorUserId", "meetingCount",
      "meetingNumber", "meetingType", name, phases, "teamId", "templateId"
    FROM "NewMeeting" WHERE id = ${meetingId}
  `.execute(pg)
  for (const userId of userIds) {
    await answer(priorMeetingId, userId, scores)
  }
}

test('the result phase holds one stage per category, ordered by urgency once revealed', async () => {
  const {userId, teamId, cookie} = await signUp()
  const [teammate, otherTeammate] = await Promise.all([signUp(), signUp()])

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
    resultStages.map(() => expect.objectContaining({score: null, scoreHistory: [], responses: []}))
  )

  // the owner is a spectator by default, so opt in before answering
  await sendPublic({query: SPECTATE, variables: {meetingId, isSpectating: false}, cookie})
  const thisCheck = [3, 1, 2, 5, 4]
  for (const [idx, stage] of responseStages.entries()) {
    await sendPublic({
      query: RESPOND,
      variables: {meetingId, stageId: stage.id, score: thisCheck[idx]},
      cookie
    })
  }
  // two teammates answer the same, except that one skips idx 2, which leaves it too few answers to score
  await answer(meetingId, teammate.userId, thisCheck)
  await answer(meetingId, otherTeammate.userId, [3, 1, null, 5, 4])
  // deltas of -4 for idx 1 and 0 for idx 3, leaving idx 0 and 4 without a previous check
  await seedPriorCheck(
    meetingId,
    [userId, teammate.userId, otherTeammate.userId],
    [null, 5, null, 5, null]
  )

  await sendPublic({query: END, variables: {meetingId}, cookie})
  const revealed = await sendPublic({query: MEETING, variables: {meetingId}, cookie})
  const revealedStages = getStages(revealed.data.viewer.meeting, 'TEAM_HEALTH_RESULT')
  // the stage inherits these from its interface, under its own team-only rules
  expect(revealedStages).toEqual(
    revealedStages.map(() =>
      expect.objectContaining({meeting: {id: meetingId}, phase: {phaseType: 'TEAM_HEALTH_RESULT'}})
    )
  )

  // categories with no previous check lead, lowest score first, then the rest by steepest drop, then
  // the category too few people scored
  expect(
    revealedStages.map(({score, scoreHistory}: any) => ({
      score,
      previousScore: scoreHistory.at(-1)?.score ?? null
    }))
  ).toEqual([
    {score: 3, previousScore: null},
    {score: 4, previousScore: null},
    {score: 1, previousScore: 5},
    {score: 5, previousScore: 5},
    {score: null, previousScore: null}
  ])
}, 60000)
