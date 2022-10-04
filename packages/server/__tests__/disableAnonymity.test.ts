import getPg, {closePg} from '../postgres/getPg'
import {getUserTeams, sendPublic, signUp} from './common'

const setDisableAnonymity = async (
  settingsId: string,
  disableAnonymity: boolean,
  authToken: string
) => {
  const setSettings = await sendPublic({
    query: `
      mutation SetMeetingSettingsMutation(
        $settingsId: ID!
        $disableAnonymity: Boolean
      ) {
        setMeetingSettings(
          settingsId: $settingsId
          disableAnonymity: $disableAnonymity
        ) {
          settings {
            ... on RetrospectiveMeetingSettings {
              disableAnonymity
            }
          }
        }
      }
    `,
    variables: {
      settingsId,
      disableAnonymity
    },
    authToken
  })

  expect(setSettings.data.setMeetingSettings.settings.disableAnonymity).toEqual(disableAnonymity)
}

const getMeetingSettings = async (teamId: string, authToken: string) => {
  const viewerQuery = await sendPublic({
    query: `
      query MeetingSettingsQuery($teamId: ID!) {
        viewer {
          team(teamId: $teamId) {
            meetingSettings(meetingType: retrospective) {
              id
              ... on RetrospectiveMeetingSettings {
                disableAnonymity
              }
            }
          }
        }
      }
    `,
    variables: {
      teamId
    },
    authToken
  })
  const meetingSettings = viewerQuery.data.viewer.team.meetingSettings
  return meetingSettings
}

const startRetro = async (teamId: string, authToken: string) => {
  const startRetroQuery = await sendPublic({
    query: `
      mutation StartRetrospectiveMutation($teamId: ID!) {
        startRetrospective(teamId: $teamId) {
          ... on ErrorPayload {
            error {
              message
            }
          }
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
    variables: {
      teamId
    },
    authToken
  })

  const meeting = startRetroQuery.data.startRetrospective.meeting
  return meeting
}

const addReflection = async (meetingId: string, promptId: string, authToken: string) => {
  const addReflection = await sendPublic({
    query: `
      mutation CreateReflectionMutation($input: CreateReflectionInput!) {
        createReflection(input: $input) {
          reflectionGroup {
            id
            reflections {
              creatorId
              creator {
                id
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        content: 'Test',
        meetingId: meetingId,
        promptId: promptId,
        sortOrder: 0
      }
    },
    authToken
  })

  const reflection = addReflection.data.createReflection.reflectionGroup.reflections[0]
  return reflection
}

test('By default all reflections are anonymous', async () => {
  const {userId, authToken} = await signUp()
  const teamId = (await getUserTeams(userId))[0].id

  const meetingSettings = await getMeetingSettings(teamId, authToken)
  expect(meetingSettings.disableAnonymity).toEqual(false)

  const meeting = await startRetro(teamId, authToken)
  const reflectPrompts = meeting.phases.find(({reflectPrompts}) => !!reflectPrompts).reflectPrompts
  const reflection = await addReflection(meeting.id, reflectPrompts[0].id, authToken)

  expect(reflection).toEqual({
    creatorId: null,
    creator: null
  })
})

test('Creator is visible when disableAnonymity is set', async () => {
  const {userId, authToken} = await signUp()
  const teamId = (await getUserTeams(userId))[0].id

  const meetingSettings = await getMeetingSettings(teamId, authToken)
  await setDisableAnonymity(meetingSettings.id, true, authToken)
  const updatedMeetingSettings = await getMeetingSettings(teamId, authToken)
  expect(updatedMeetingSettings.disableAnonymity).toEqual(true)

  const meeting = await startRetro(teamId, authToken)
  const reflectPrompts = meeting.phases.find(({reflectPrompts}) => !!reflectPrompts).reflectPrompts
  const reflection = await addReflection(meeting.id, reflectPrompts[0].id, authToken)

  expect(reflection).toEqual({
    creatorId: userId,
    creator: {
      id: userId
    }
  })
})

test('Super user can always read creatorId of a reflection', async () => {
  const {userId, email, authToken, password} = await signUp()
  const teamId = (await getUserTeams(userId))[0].id

  const meetingSettings = await getMeetingSettings(teamId, authToken)
  expect(meetingSettings.disableAnonymity).toEqual(false)

  const meeting = await startRetro(teamId, authToken)
  const reflectPrompts = meeting.phases.find(({reflectPrompts}) => !!reflectPrompts).reflectPrompts

  await addReflection(meeting.id, reflectPrompts[0].id, authToken)

  const pg = getPg()
  await pg.query(`UPDATE "User" SET rol='su' WHERE id='${userId}'`)
  await closePg()

  const login = await sendPublic({
    query: `
      mutation LoginWithPasswordMutation(
        $email: ID!
        $password: String!
      ) {
        loginWithPassword(email: $email, password: $password) {
          authToken
        }
      }
    `,
    variables: {
      email,
      password
    }
  })

  const superUsermeetingQuery = await sendPublic({
    query: `
      query($meetingId: ID!) {
        viewer {
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              reflectionGroups {
                id
                reflections {
                  creatorId
                  creator {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      meetingId: meeting.id
    },
    authToken: login.data.loginWithPassword.authToken
  })

  const reflection = superUsermeetingQuery.data.viewer.meeting.reflectionGroups[0].reflections[0]
  expect(reflection).toEqual({
    creatorId: userId,
    creator: null // we still hide this to avoid accidentally show the author for super users
  })
})
