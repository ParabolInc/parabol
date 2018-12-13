import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveTeam} from 'server/graphql/resolvers'
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import Team from 'server/graphql/types/Team'
import NotificationTeamInvitation from './NotificationTeamInvitation'

const InviteToTeamPayload = new GraphQLObjectType({
  name: 'InviteToTeamPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      description: 'The team the inviter is inviting the invitee to',
      resolve: resolveTeam
    },
    invitees: {
      description: 'A list of email addresses the invitations were sent to',
      type: new GraphQLList(new GraphQLNonNull(GraphQLEmailType))
    },
    teamInvitationNotificationId: {
      type: GraphQLID,
      description: 'the notification ID if this payload is sent to a subscriber, else null'
    },
    teamInvitationNotification: {
      type: NotificationTeamInvitation,
      description: 'The notification sent to the invitee if they are a parabol user',
      resolve: ({teamInvitationNotificationId}, _args, {dataLoader}) => {
        return dataLoader.get('notifications').load(teamInvitationNotificationId)
      }
    }
  })
})

export default InviteToTeamPayload
