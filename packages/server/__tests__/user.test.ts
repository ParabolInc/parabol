import faker from 'faker'
import TeamMemberId from '../../client/shared/gqlIds/TeamMemberId'
import getKysely from '../postgres/getKysely'
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

test('Creating and archiving teams updates User.tms', async () => {
  const user = await signUp()

  const user1 = await sendPublic({
    query: `
      query Viewer {
        viewer {
          id
          tms
          organizations {
            id
          }
        }
      }
    `,
    authToken: user.authToken
  })

  expect(user1).toMatchObject({
    data: {
      viewer: {
        id: user.userId,
        tms: [expect.any(String)],
        organizations: [
          {
            id: expect.any(String)
          }
        ]
      }
    }
  })
  const team1Id = user1.data.viewer.tms[0]
  const orgId = user1.data.viewer.organizations[0].id
  const createdTeam = await sendPublic({
    query: `
      mutation CreateTeam($newTeam: NewTeamInput!) {
        addTeam(newTeam: $newTeam) {
          team {
            id
          }
          error {
            message
          }
        }
      }
    `,
    variables: {
      newTeam: {
        name: 'My Team',
        orgId,
        isPublic: true
      }
    },
    authToken: user.authToken
  })
  expect(createdTeam).toMatchObject({
    data: {
      addTeam: {
        team: {
          id: expect.any(String)
        }
      }
    }
  })
  const team2Id = createdTeam.data.addTeam.team.id

  const user2 = await sendPublic({
    query: `
      query Viewer {
        viewer {
          id
          tms
        }
      }
    `,
    authToken: user.authToken
  })

  expect(user2).toMatchObject({
    data: {
      viewer: {
        id: user.userId,
        tms: [team1Id, team2Id]
      }
    }
  })

  const archivedTeam = await sendPublic({
    query: `
      mutation ArchiveTeam($teamId: ID!) {
        archiveTeam(teamId: $teamId) {
          error {
            message
          }
        }
      }
    `,
    variables: {
      teamId: team1Id
    },
    authToken: user.authToken
  })
  expect(archivedTeam).toMatchObject({
    data: {
      archiveTeam: {
        error: null
      }
    }
  })

  const user3 = await sendPublic({
    query: `
      query Viewer {
        viewer {
          id
          tms
        }
      }
    `,
    authToken: user.authToken
  })

  expect(user3).toMatchObject({
    data: {
      viewer: {
        id: user.userId,
        tms: [team2Id]
      }
    }
  })
})

test('Leaving a team updates User.tms', async () => {
  const user = await signUp()

  const user1 = await sendPublic({
    query: `
      query Viewer {
        viewer {
          id
          tms
        }
      }
    `,
    authToken: user.authToken
  })

  expect(user1).toMatchObject({
    data: {
      viewer: {
        id: user.userId,
        tms: [expect.any(String)]
      }
    }
  })
  const teamId = user1.data.viewer.tms[0]
  const teamMemberId = TeamMemberId.join(teamId, user.userId)
  console.log('teamMemberId', teamMemberId)

  const leftTeam = await sendPublic({
    query: `
      mutation RemoveTeamMember($teamMemberId: ID!) {
        removeTeamMember(teamMemberId: $teamMemberId) {
          error {
            message
          }
        }
      }
    `,
    variables: {
      teamMemberId
    },
    authToken: user.authToken
  })
  expect(leftTeam).toMatchObject({
    data: {
      removeTeamMember: {
        error: null
      }
    }
  })

  const user2 = await sendPublic({
    query: `
      query Viewer {
        viewer {
          id
          tms
        }
      }
    `,
    authToken: user.authToken
  })

  expect(user2).toMatchObject({
    data: {
      viewer: {
        id: user.userId,
        tms: []
      }
    }
  })

  // real bug might be triggered by setting isArchived to false explicitly even if it's already false
  // anyhow, the member is removed, so this shouldn't add the team back to the user
  await getKysely().updateTable('Team').set({isArchived: false}).where('id', '=', teamId).execute()
  const user3 = await sendPublic({
    query: `
      query Viewer {
        viewer {
          id
          tms
        }
      }
    `,
    authToken: user.authToken
  })

  expect(user3).toMatchObject({
    data: {
      viewer: {
        id: user.userId,
        tms: []
      }
    }
  })
})
