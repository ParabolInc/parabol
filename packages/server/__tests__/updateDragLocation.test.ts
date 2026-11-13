import {sendPublic, signUp} from './common'

const START_RETROSPECTIVE = `
  mutation StartRetrospective($teamId: ID!) {
    startRetrospective(teamId: $teamId) {
      ... on StartRetrospectiveSuccess {
        meeting {
          id
        }
      }
    }
  }
`

const UPDATE_DRAG_LOCATION = `
  mutation UpdateDragLocation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input)
  }
`

const startRetrospective = async (teamId: string, cookie: string) => {
  const res = await sendPublic({query: START_RETROSPECTIVE, variables: {teamId}, cookie})
  return res.data.startRetrospective.meeting.id as string
}

const updateDragLocation = (teamId: string, meetingId: string, cookie: string) =>
  sendPublic({
    query: UPDATE_DRAG_LOCATION,
    variables: {
      input: {
        id: 'drag1',
        clientHeight: 800,
        clientWidth: 1200,
        meetingId,
        sourceId: 'reflection1',
        teamId
      }
    },
    cookie
  })

test('a drag location cannot be broadcast to another team’s meeting', async () => {
  const [outsider, owner] = await Promise.all([signUp(), signUp()])
  const meetingId = await startRetrospective(owner.teamId, owner.cookie)

  const res = await updateDragLocation(outsider.teamId, meetingId, outsider.cookie)

  expect(res).toEqual({
    data: {updateDragLocation: null},
    errors: [expect.objectContaining({message: 'Viewer is not on team'})]
  })
})

test('a team member broadcasts a drag location to their own meeting', async () => {
  const owner = await signUp()
  const meetingId = await startRetrospective(owner.teamId, owner.cookie)

  const res = await updateDragLocation(owner.teamId, meetingId, owner.cookie)

  expect(res).toEqual({data: {updateDragLocation: true}})
})
