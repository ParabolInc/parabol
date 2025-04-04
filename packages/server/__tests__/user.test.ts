import faker from 'faker'
import {sendIntranet, sendPublic, signUp, signUpWithEmail} from './common'

test('Get user by id', async () => {
  const {email, userId} = await signUp()

  const user = await sendIntranet({
    query: `
      query User($userId: ID!) {
        user(userId: $userId) {
          id
          email
          organizations {
            id
          }
        }
      }
    `,
    variables: {
      userId
    }
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        email,
        organizations: expect.arrayContaining([
          {
            id: expect.anything()
          }
        ])
      }
    }
  })
})

test('Get user by email', async () => {
  const {email, userId} = await signUp()

  const user = await sendIntranet({
    query: `
      query User($email: String!) {
        user(email: $email) {
          id
          email
          organizations {
            id
          }
        }
      }
    `,
    variables: {
      email
    }
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        email,
        organizations: expect.arrayContaining([
          {
            id: expect.anything()
          }
        ])
      }
    }
  })
})

test('First user is patientZero', async () => {
  const domain = faker.internet.domainName()
  const email1 = `${faker.internet.userName()}@${domain}`
  const email2 = `${faker.internet.userName()}@${domain}`

  const {userId: user1Id} = await signUpWithEmail(email1)
  const {userId: user2Id} = await signUpWithEmail(email2)

  const query = `
      query User($userId: ID!) {
        user(userId: $userId) {
          id
          isPatient0
        }
      }
    `
  const user1 = await sendIntranet({
    query,
    variables: {
      userId: user1Id
    }
  })

  expect(user1).toMatchObject({
    data: {
      user: {
        id: user1Id,
        isPatient0: true
      }
    }
  })

  const user2 = await sendIntranet({
    query,
    variables: {
      userId: user2Id
    }
  })

  expect(user2).toMatchObject({
    data: {
      user: {
        id: user2Id,
        isPatient0: false
      }
    }
  })
})

// The tests only work after the embeddings were generated, which is not the case on CI
test.skip.each([
  ['card game', ['moscowPrioritizationTemplate', 'estimatedEffortTemplate', 'wsjfTemplate']],
  ['winning loosing', ['winningStreakTemplate']],
  [
    'project failure',
    [
      'whyDidTheProjectFailPremortemTemplate',
      'successAndFailurePremortemTemplate',
      'postmortemAnalysisTemplate',
      'blamelessPostmortemTemplate',
      'simplePostmortemTemplate',
      'softwareProjectPostmortemTemplate',
      'movieDirectorPostmortemTemplate',
      'fortuneTellerPremortemTemplate',
      'timelinePremortemTemplate',
      'howLikelyToFailPremortemTemplate',
      'engineeringPostmortemTemplate',
      'resourceAllocationPremortemTemplate',
      'processImprovementPostmortemTemplate',
      'incidentImpactPostmortemTemplate',
      'bestworstCaseScenarioPremortemTemplate',
      'gameShowPostmortemTemplate',
      'timeTravelPostmortemTemplate',
      'teamEfficiencyPremortemTemplate',
      'risksAndPrecautionsPremortemTemplate',
      'obstacleCoursePremortemTemplate',
      'stakeholderSatisfactionPostmortemTemplate'
    ]
  ],
  ['christmas', ['aChristmasCarolRetrospectiveTemplate']],
  ['risk management', ['riskManagementPostmortemTemplate', 'risksAndPrecautionsPremortemTemplate']],
  ['animals', ['iguanaCrocodileKomodoDragonPremortemTemplate']],
  ['plants', ['roseThornBudTemplate']]
])('Template search - %s', async (search, templateIds) => {
  const {authToken} = await signUp()

  const user = await sendPublic({
    query: `
      query Template($search: String!) {
        viewer {
          templateSearch(search: $search) {
            id
          }
        }
      }
    `,
    variables: {
      search
    },
    authToken
  })

  expect(user).toMatchObject({
    data: {
      viewer: {
        templateSearch: expect.arrayContaining(templateIds.map((id) => ({id})))
      }
    }
  })
})
