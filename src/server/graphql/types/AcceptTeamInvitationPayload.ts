import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveTeam, resolveTeamMember} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import Team from 'server/graphql/types/Team'
import TeamMember from 'server/graphql/types/TeamMember'

const AcceptTeamInvitationPayload = new GraphQLObjectType({
  name: 'AcceptTeamInvitationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      description: 'The team that the invitee will be joining',
      resolve: resolveTeam
    },
    teamMember: {
      type: TeamMember,
      description: 'The new team member on the team',
      resolve: resolveTeamMember
    },
    removedNotificationIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'The invite notifications that are no longer necessary'
    }
  })
})

export default AcceptTeamInvitationPayload
