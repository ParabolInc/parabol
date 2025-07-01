import {getUserTeams, sendPublic, signUp} from './common'

test('Retro is named Retro #1 by default', async () => {
  const {userId, authToken} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  const newRetro = await sendPublic({
    query: `
      mutation StartRetrospectiveMutation($teamId: ID!, $name: String, $rrule: RRule, $gcalInput: CreateGcalEventInput) {
        startRetrospective(teamId: $teamId, name: $name, rrule: $rrule, gcalInput: $gcalInput) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on StartRetrospectiveSuccess {
            meeting {
              id
              name
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
  expect(newRetro).toMatchObject({
    data: {
      startRetrospective: {
        meeting: {
          id: expect.anything(),
          name: 'Retro #1'
        }
      }
    }
  })
})

test('Single Retro can be named', async () => {
  const {userId, authToken} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  const name = 'My Retro'
  const newRetro = await sendPublic({
    query: `
      mutation StartRetrospectiveMutation($teamId: ID!, $name: String, $rrule: RRule, $gcalInput: CreateGcalEventInput) {
        startRetrospective(teamId: $teamId, name: $name, rrule: $rrule, gcalInput: $gcalInput) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on StartRetrospectiveSuccess {
            meeting {
              id
              name
            }
          }
        }
      }
    `,
    variables: {
      teamId,
      name
    },
    authToken
  })
  expect(newRetro).toMatchObject({
    data: {
      startRetrospective: {
        meeting: {
          id: expect.anything(),
          name
        }
      }
    }
  })
})
