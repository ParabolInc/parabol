import {sendPublic, signUp} from './common'

const START = `
  mutation StartTeamHealth($teamIds: [ID!]!, $templateId: ID!) {
    startTeamHealth(teamIds: $teamIds, templateId: $templateId) {
      meetings {
        id
        phases {
          phaseType
          stages { id }
        }
      }
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

const SPECTATE = `
  mutation SetTeamHealthSpectate($meetingId: ID!, $isSpectating: Boolean!) {
    setTeamHealthSpectate(meetingId: $meetingId, isSpectating: $isSpectating) {
      meetingMember { id }
    }
  }
`

const IS_COMPLETE = `
  query ViewerComplete($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on TeamHealthMeeting {
          isViewerComplete
        }
      }
    }
  }
`

const readIsComplete = async (meetingId: string, cookie: string) => {
  const res = await sendPublic({query: IS_COMPLETE, variables: {meetingId}, cookie})
  return res.data.viewer.meeting.isViewerComplete
}

test('isViewerComplete flips only once every question has an answer', async () => {
  const {teamId, cookie} = await signUp()
  const start = await sendPublic({
    query: START,
    variables: {teamIds: [teamId], templateId: 'googleProjectAristotleTemplate'},
    cookie
  })
  const meeting = start.data.startTeamHealth.meetings[0]
  const meetingId = meeting.id
  const responseStages = meeting.phases.find(
    (phase: any) => phase.phaseType === 'TEAM_HEALTH_RESPONSE'
  ).stages
  expect(responseStages.length).toBeGreaterThan(1)

  expect(await readIsComplete(meetingId, cookie)).toBe(false)

  await sendPublic({query: SPECTATE, variables: {meetingId, isSpectating: false}, cookie})
  for (const [idx, stage] of responseStages.entries()) {
    // a skipped question is a deliberate answer, so the last one goes in with a null score
    const score = idx === responseStages.length - 1 ? null : 3
    await sendPublic({query: RESPOND, variables: {meetingId, stageId: stage.id, score}, cookie})
    const isLast = idx === responseStages.length - 1
    expect(await readIsComplete(meetingId, cookie)).toBe(isLast)
  }
})
