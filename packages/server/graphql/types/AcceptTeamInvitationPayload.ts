import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveTeam, resolveTeamMember} from '../resolvers'
import {GQLContext} from './../graphql'
import NotificationTeamInvitation from './NotificationTeamInvitation'
import StandardMutationError from './StandardMutationError'
import Team from './Team'
import TeamMember from './TeamMember'
import User from './User'

const AcceptTeamInvitationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AcceptTeamInvitationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authToken: {
      type: GraphQLID,
      description: 'The new auth token sent to the mutator'
    },
    meetingId: {
      type: GraphQLID,
      description: 'the meetingId to redirect to'
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
    notifications: {
      type: NotificationTeamInvitation,
      resolve: (
        {notificationId}: {notificationId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        return dataLoader.get('notifications').load(notificationId)
      }
    },
    teamLead: {
      type: User,
      description: 'For payloads going to the team leader that got new suggested actions',
      resolve: async (
        {teamLeadId}: {teamLeadId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        return teamLeadId ? dataLoader.get('users').load(teamLeadId) : null
      }
    }
  })
})

export default AcceptTeamInvitationPayload
