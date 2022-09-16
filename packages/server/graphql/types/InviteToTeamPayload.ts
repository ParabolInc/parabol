import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import GraphQLEmailType from './GraphQLEmailType'
import NotificationTeamInvitation from './NotificationTeamInvitation'
import StandardMutationError from './StandardMutationError'
import Team from './Team'

const InviteToTeamPayload = new GraphQLObjectType<any, GQLContext>({
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
      resolve: ({teamInvitationNotificationId}, _args: unknown, {dataLoader}) => {
        return teamInvitationNotificationId
          ? dataLoader.get('notifications').load(teamInvitationNotificationId)
          : null
      }
    },
    removedSuggestedActionId: {
      type: GraphQLID,
      description: 'the `invite your team` suggested action that was removed, if any'
    }
  })
})

export default InviteToTeamPayload
