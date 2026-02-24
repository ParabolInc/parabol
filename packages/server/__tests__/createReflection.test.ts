import {sendPublic, signUp} from './common'

const startRetro = async (teamId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      mutation StartRetrospectiveMutation($teamId: ID!) {
        startRetrospective(teamId: $teamId) {
          ... on StartRetrospectiveSuccess {
            meeting {
              id
              phases {
                ... on ReflectPhase {
                  reflectPrompts {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {teamId},
    cookie
  })

  const meeting = res.data.startRetrospective.meeting
  const reflectPrompts = meeting.phases.find((p: any) => p.reflectPrompts).reflectPrompts

  return {
    meetingId: meeting.id,
    promptId: reflectPrompts[0].id
  }
}

const getReflectionCount = async (meetingId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      query MeetingQuery($meetingId: ID!) {
        viewer {
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              reflectionGroups {
                reflections {
                  id
                }
              }
            }
          }
        }
      }
    `,
    variables: {meetingId},
    cookie
  })

  const groups = res.data.viewer.meeting.reflectionGroups || []
  return groups.reduce((sum: number, group: any) => sum + group.reflections.length, 0)
}

test('createReflection blocks adding a reflection when viewer is not a member of the meeting', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])

  const {meetingId, promptId} = await startRetro(victim.teamId, victim.cookie)
  const beforeCount = await getReflectionCount(meetingId, victim.cookie)

  const createReflectionRes = await sendPublic({
    query: `
      mutation CreateReflectionMutation($input: CreateReflectionInput!) {
        createReflection(input: $input) {
          ... on CreateReflectionPayload {
            reflectionId
          }
        }
      }
    `,
    variables: {
      input: {
        content: 'Unauthorized reflection attempt',
        meetingId,
        promptId,
        sortOrder: 0
      }
    },
    cookie: attacker.cookie
  })

  expect(createReflectionRes).toEqual({
    data: {
      createReflection: null
    },
    errors: [
      expect.objectContaining({
        message: expect.stringMatching('Viewer is not on team')
      })
    ]
  })

  const afterCount = await getReflectionCount(meetingId, victim.cookie)
  expect(afterCount).toBe(beforeCount)
})
