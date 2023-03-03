//@ts-ignore
import faker from 'faker'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {signUpWithEmail} from './common'
import socketConnection from './socketConnection'

export const signUp = async (invitationToken?: string) => {
  //FIXME #1402 email addresses are case sensitive
  const email = faker.internet.email().toLowerCase()
  return signUpWithEmail(email, invitationToken)
}

test('TeamSubscription sends update on joining team', async () => {
  const {authToken} = await signUp()

  const connection = await socketConnection(authToken)

  const teamResult = await connection.query({
    query: `
      query Viewer {
        viewer {
          teams {
            id
            isOnboardTeam
          }
        }
      }
    `
  })

  const teamId = teamResult.data.viewer.teams[0].id

  const teamSubscription = connection.subscribe({
    query: `
      subscription TeamSubscription {
        teamSubscription {
          __typename
          ... on AcceptTeamInvitationPayload {
            team {
              id
            }
            teamMember {
              id
              viewer {
                id
              }
            }
          }
          ... on UpdateUserProfilePayload {
            teamMembers {
              preferredName
              picture
              user {
                picture
                preferredName
                id
              }
              id
            }
          }
        }
      }
    `
  })

  const massInvitationResult = await connection.query({
    query: `
      query MassInvitationTokenLinkQuery(
        $teamId: ID!
      ) {
        viewer {
          team(teamId: $teamId) {
            id
            massInvitation {
              id
              expiration
            }
          }
          id
        }
      }
    `,
    variables: {
      teamId
    }
  })

  const invitationToken = massInvitationResult.data.viewer.team.massInvitation.id

  const newTeamMates = await Promise.all([
    signUp(invitationToken),
    signUp(invitationToken),
    signUp(invitationToken)
  ])

  const notifications = await Promise.all(
    newTeamMates.map(async () => {
      const {value} = await teamSubscription.next()
      return value
    })
  )

  for (const mate of newTeamMates) {
    const {userId} = mate
    expect(notifications).toContainEqual({
      data: {
        teamSubscription: {
          __typename: 'AcceptTeamInvitationPayload',
          team: {
            id: teamId
          },
          teamMember: {
            id: TeamMemberId.join(teamId, userId)
          }
        }
      }
    })
  }
})
