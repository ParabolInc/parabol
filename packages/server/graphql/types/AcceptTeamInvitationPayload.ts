import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveTeam, resolveTeamMember} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import Team from './Team'
import TeamMember from './TeamMember'
import User from './User'

const AcceptTeamInvitationPayload = new GraphQLObjectType({
  name: 'AcceptTeamInvitationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authToken: {
      type: GraphQLID,
      description: 'The new auth token sent to the mutator'
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
    },
    teamLead: {
      type: User,
      description: 'For payloads going to the team leader that got new suggested actions',
      resolve: async ({teamLeadId}, _args, {dataLoader}) => {
        return teamLeadId ? dataLoader.get('users').load(teamLeadId) : null
      }
    }
  })
})

export default AcceptTeamInvitationPayload
