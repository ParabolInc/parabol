import {sendPublic, signUp} from './common'

const START_CHECK_IN = `
  mutation StartCheckIn($teamId: ID!) {
    startCheckIn(teamId: $teamId) {
      meeting {
        id
      }
    }
  }
`

const VIEWER_MEETINGS = `
  query ViewerMeetings($teamIds: [ID!], $after: DateTime, $before: DateTime!) {
    viewer {
      meetings(
        first: 10
        teamIds: $teamIds
        meetingTypes: [action, retrospective, poker, teamPrompt, teamHealth]
        after: $after
        before: $before
      ) {
        edges {
          node {
            id
            teamId
          }
        }
      }
    }
  }
`

const getViewerMeetings = async (cookie: string, teamIds?: string[]) => {
  const res = await sendPublic({
    query: VIEWER_MEETINGS,
    variables: {
      teamIds,
      after: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      before: new Date(Date.now() + 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.viewer.meetings.edges.map(({node}: {node: {id: string; teamId: string}}) => node)
}

test('omitting teamIds returns meetings on every team the viewer is on', async () => {
  const [viewer, outsider] = await Promise.all([signUp(), signUp()])
  const startRes = await sendPublic({
    query: START_CHECK_IN,
    variables: {teamId: viewer.teamId},
    cookie: viewer.cookie
  })
  const meetingId = startRes.data.startCheckIn.meeting.id
  await sendPublic({
    query: START_CHECK_IN,
    variables: {teamId: outsider.teamId},
    cookie: outsider.cookie
  })

  expect(await getViewerMeetings(viewer.cookie)).toEqual([{id: meetingId, teamId: viewer.teamId}])
  expect(await getViewerMeetings(viewer.cookie, [])).toEqual([])
})
