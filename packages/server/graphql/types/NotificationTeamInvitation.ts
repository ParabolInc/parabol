import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveTeam} from '../resolvers'
import Notification, {notificationInterfaceFields} from './Notification'
import Team from './Team'
import TeamNotification from './TeamNotification'
import TeamInvitation from './TeamInvitation'
import {GQLContext} from '../graphql'

const NotificationTeamInvitation = new GraphQLObjectType<any, GQLContext>({
  name: 'NotificationTeamInvitation',
  description: 'A notification sent to a user that was invited to a new team',
  interfaces: () => [Notification, TeamNotification],
  fields: () => ({
    teamId: {
      description: 'FK',
      type: new GraphQLNonNull(GraphQLID)
    },
    invitationId: {
      description: 'FK',
      type: new GraphQLNonNull(GraphQLID)
    },
    invitation: {
      description: 'The invitation that triggered this notification',
      type: new GraphQLNonNull(TeamInvitation),
      resolve: async ({invitationId}, _args, {dataLoader}) => {
        return dataLoader.get('teamInvitations').load(invitationId)
      }
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: resolveTeam
    },
    ...notificationInterfaceFields
  })
})

export default NotificationTeamInvitation
